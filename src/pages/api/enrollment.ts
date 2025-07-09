import type { APIRoute } from 'astro';
import { submitEnrollmentForm } from '../../lib/database';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Add overall timeout for the entire request
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 25000)
    );
    
    const processRequest = async () => {
    // Check Content-Type header
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read request body as text first
    const bodyText = await request.text();
    
    // Check if body is empty
    if (!bodyText || bodyText.trim() === '') {
      return new Response(JSON.stringify({ error: 'Request body is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse JSON with error handling
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.courseId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Submit to database
    const result = await submitEnrollmentForm({
      course_id: data.courseId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      experience_level: data.experience,
      learning_goals: data.goals,
      is_free: data.isFree === 'true'
    });
    
    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Enrollment submitted successfully',
        id: result.data.id,
        status: result.data.status
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error(result.error);
    }
    };
    
    return await Promise.race([processRequest(), timeoutPromise]);
    
  } catch (error) {
    console.error('Enrollment error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
      statusCode = 408;
    } else if (error.message.includes('connection')) {
      errorMessage = 'Database connection failed. Please try again later.';
      statusCode = 503;
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};