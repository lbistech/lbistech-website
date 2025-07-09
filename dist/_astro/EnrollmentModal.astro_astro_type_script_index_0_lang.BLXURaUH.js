const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/supabase.BvhCLKPn.js","_astro/preload-helper.BlTxHScW.js"])))=>i.map(i=>d[i]);
import{_ as u}from"./preload-helper.BlTxHScW.js";document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("enrollment-modal"),i=document.getElementById("close-modal"),r=document.getElementById("enrollment-form");function s(){t?.classList.add("hidden"),document.body.style.overflow="auto"}i?.addEventListener("click",s),t?.addEventListener("click",function(o){o.target===t&&s()}),document.addEventListener("keydown",function(o){o.key==="Escape"&&!t?.classList.contains("hidden")&&s()}),r?.addEventListener("submit",async function(o){o.preventDefault();const c=new FormData(r),e=Object.fromEntries(c);if(!e.firstName||!e.lastName||!e.email||!e.phone||!e.terms){alert("Please fill in all required fields and accept the terms.");return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)){alert("Please enter a valid email address.");return}const n=r.querySelector('button[type="submit"]'),m=n.innerHTML;n.innerHTML='<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...',n.disabled=!0;try{const{submitEnrollmentForm:a}=await u(async()=>{const{submitEnrollmentForm:d}=await import("./supabase.BvhCLKPn.js");return{submitEnrollmentForm:d}},__vite__mapDeps([0,1])),l=await a({course_id:e.courseId,first_name:e.firstName,last_name:e.lastName,email:e.email,phone:e.phone,experience_level:e.experience,learning_goals:e.goals,is_free:e.isFree==="true"});if(!l.success)throw new Error(l.error||"Failed to process enrollment");e.isFree==="true"?alert(`🎉 Congratulations! You've successfully enrolled in the ${e.courseId} course.

You now have access to:
• Complete video training series
• Course materials
• WhatsApp community
• Certificate upon completion

Check your email for access details!`):alert(`Thank you for your interest in ${e.courseId}!

Our team will contact you within 24 hours to complete the enrollment process and discuss payment options.

You can also reach us directly via WhatsApp for immediate assistance.`),s(),r.reset()}catch(a){console.error("Enrollment error:",a),alert("Sorry, there was an error processing your enrollment. Please try again or contact us directly.")}finally{n.innerHTML=m,n.disabled=!1}})});window.openEnrollmentModal=function(){document.getElementById("enrollment-modal")?.classList.remove("hidden"),document.body.style.overflow="hidden"};
