import{getContactSubmissions as c,getEnrollmentSubmissions as d,updateSubmissionStatus as i}from"./supabase.BvhCLKPn.js";import"./preload-helper.BlTxHScW.js";document.addEventListener("DOMContentLoaded",async function(){const e=document.querySelectorAll(".tab-button"),a=document.querySelectorAll(".tab-content");e.forEach(t=>{t.addEventListener("click",()=>{const o=t.getAttribute("data-tab");e.forEach(n=>{n.classList.remove("active","border-blue-500","text-blue-600"),n.classList.add("border-transparent","text-gray-500")}),t.classList.add("active","border-blue-500","text-blue-600"),t.classList.remove("border-transparent","text-gray-500"),a.forEach(n=>{n.classList.add("hidden")}),document.getElementById(`${o}-tab`).classList.remove("hidden")})}),await s()});async function s(){try{const e=await c(),a=await d();document.getElementById("contact-count").textContent=e.length,document.getElementById("enrollment-count").textContent=a.length;const t=a.filter(r=>r.status==="pending").length;document.getElementById("pending-count").textContent=t;const o=new Date().toDateString(),n=[...e,...a].filter(r=>new Date(r.created_at).toDateString()===o).length;document.getElementById("today-count").textContent=n,p(e),u(a)}catch(e){console.error("Error loading dashboard data:",e)}}function p(e){const a=document.getElementById("contact-table-body");a.innerHTML=e.map(t=>`
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${t.first_name} ${t.last_name}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${t.email}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${t.course_interest||"General"}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${l(t.status)}">
            ${t.status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${new Date(t.created_at).toLocaleDateString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button onclick="viewSubmission('contact', '${t.id}')" class="text-blue-600 hover:text-blue-900 mr-3">View</button>
          <button onclick="updateStatus('contact_submissions', '${t.id}', 'resolved')" class="text-green-600 hover:text-green-900">Mark Resolved</button>
        </td>
      </tr>
    `).join("")}function u(e){const a=document.getElementById("enrollment-table-body");a.innerHTML=e.map(t=>`
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${t.first_name} ${t.last_name}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${t.email}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${t.course_id}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.is_free?"bg-green-100 text-green-800":"bg-blue-100 text-blue-800"}">
            ${t.is_free?"Free":"Paid"}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${l(t.status)}">
            ${t.status}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${new Date(t.created_at).toLocaleDateString()}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button onclick="viewSubmission('enrollment', '${t.id}')" class="text-blue-600 hover:text-blue-900 mr-3">View</button>
          <button onclick="updateStatus('enrollment_submissions', '${t.id}', 'enrolled')" class="text-green-600 hover:text-green-900">Enroll</button>
        </td>
      </tr>
    `).join("")}function l(e){switch(e){case"new":case"pending":return"bg-yellow-100 text-yellow-800";case"in_progress":case"payment_pending":return"bg-blue-100 text-blue-800";case"resolved":case"enrolled":return"bg-green-100 text-green-800";case"closed":case"cancelled":return"bg-gray-100 text-gray-800";default:return"bg-gray-100 text-gray-800"}}window.viewSubmission=function(e,a){alert(`View ${e} submission: ${a}`)};window.updateStatus=async function(e,a,t){try{await i(e,a,t),await s(),alert("Status updated successfully!")}catch(o){console.error("Error updating status:",o),alert("Error updating status")}};
