import { Pool } from 'pg';

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || '63.177.40.165',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lbistech_website',
  user: process.env.DB_USER || 'lbistech_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
});

// Database types
export interface ContactSubmission {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  course_interest?: string;
  message: string;
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  created_at?: string;
  updated_at?: string;
}

export interface EnrollmentSubmission {
  id?: string;
  course_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  experience_level?: string;
  learning_goals?: string;
  is_free: boolean;
  status?: 'pending' | 'enrolled' | 'payment_pending' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

// Database functions
export async function submitContactForm(data: Omit<ContactSubmission, 'id' | 'created_at' | 'updated_at'>) {
  let client;
  try {
    // Add timeout for getting client from pool
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 30000)
      )
    ]);
    
    const query = `
      INSERT INTO contact_submissions (first_name, last_name, email, phone, course_interest, message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      data.first_name,
      data.last_name,
      data.email,
      data.phone,
      data.course_interest,
      data.message
    ];
    
    // Add timeout for query execution
    const result = await Promise.race([
      client.query(query, values),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query execution timeout')), 45000)
      )
    ]);
    
    // Send notification
    try {
      await sendNotification('contact', result.rows[0]);
    } catch (notificationError) {
      console.warn('Failed to send notification, but contact form was successful:', notificationError);
    }
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Contact form submission error:', error);
    return { 
      success: false, 
      error: error.message || 'Database connection failed. Please try again.' 
    };
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing database client:', releaseError);
      }
    }
  }
}

export async function submitEnrollmentForm(data: Omit<EnrollmentSubmission, 'id' | 'created_at' | 'updated_at'>) {
  let client;
  try {
    // Add timeout for getting client from pool
    client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 30000)
      )
    ]);
    
    const query = `
      INSERT INTO enrollment_submissions (course_id, first_name, last_name, email, phone, experience_level, learning_goals, is_free)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      data.course_id,
      data.first_name,
      data.last_name,
      data.email,
      data.phone,
      data.experience_level,
      data.learning_goals,
      data.is_free
    ];
    
    // Add timeout for query execution
    const result = await Promise.race([
      client.query(query, values),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query execution timeout')), 45000)
      )
    ]);
    
    // Send notification
    try {
      await sendNotification('enrollment', result.rows[0]);
    } catch (notificationError) {
      console.warn('Failed to send notification, but enrollment was successful:', notificationError);
    }
    
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('Enrollment form submission error:', error);
    return { 
      success: false, 
      error: error.message || 'Database connection failed. Please try again.' 
    };
  } finally {
    if (client) {
      try {
        client.release();
      } catch (releaseError) {
        console.error('Error releasing database client:', releaseError);
      }
    }
  }
}

// Admin functions
export async function getContactSubmissions(limit = 50) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM contact_submissions 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    const result = await client.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getEnrollmentSubmissions(limit = 50) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM enrollment_submissions 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    const result = await client.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching enrollment submissions:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateSubmissionStatus(
  table: 'contact_submissions' | 'enrollment_submissions',
  id: string,
  status: string
) {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE ${table} 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await client.query(query, [status, id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating submission status:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Email notification function
async function sendNotification(type: 'contact' | 'enrollment', data: any) {
  try {
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const emailData = type === 'contact' 
      ? getContactEmailData(data)
      : getEnrollmentEmailData(data);

    await transporter.sendMail(emailData);
    console.log(`${type} notification sent successfully`);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

function getContactEmailData(data: any) {
  return {
    from: process.env.SMTP_FROM || 'noreply@lbistech.com',
    to: process.env.ADMIN_EMAIL || 'info@lbistech.com',
    subject: `New Contact Form Submission - ${data.first_name} ${data.last_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong>Course Interest:</strong> ${data.course_interest || 'General inquiry'}</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap;">${data.message}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏰ Submitted:</strong> ${new Date(data.created_at).toLocaleString()}</p>
        </div>
      </div>
    `,
  };
}

function getEnrollmentEmailData(data: any) {
  return {
    from: process.env.SMTP_FROM || 'noreply@lbistech.com',
    to: process.env.ADMIN_EMAIL || 'info@lbistech.com',
    subject: `New Course Enrollment - ${data.course_id} - ${data.first_name} ${data.last_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Course Enrollment</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Student Details</h3>
          <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Experience Level:</strong> ${data.experience_level || 'Not specified'}</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Course Information</h3>
          <p><strong>Course:</strong> ${data.course_id}</p>
          <p><strong>Type:</strong> ${data.is_free ? '🆓 Free Course' : '💰 Paid Course'}</p>
        </div>
        
        ${data.learning_goals ? `
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Learning Goals</h3>
          <p style="white-space: pre-wrap;">${data.learning_goals}</p>
        </div>
        ` : ''}
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏰ Enrolled:</strong> ${new Date(data.created_at).toLocaleString()}</p>
        </div>
      </div>
    `,
  };
}

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}