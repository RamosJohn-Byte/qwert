// DOM elements
const registerForm = document.getElementById("register-form")
const errorMessage = document.getElementById("error-message")

// Initialize Supabase client (replace with your Supabase URL and Key)
const supabaseUrl = "YOUR_SUPABASE_URL" // Replace with your Supabase URL
const supabaseKey = "YOUR_SUPABASE_ANON_KEY" // Replace with your Supabase Anon Key
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// Handle register form submission
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirm-password").value

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Show loading state
      const submitBtn = registerForm.querySelector('button[type="submit"]')
      const originalBtnText = submitBtn.textContent
      submitBtn.textContent = "Registering..."
      submitBtn.disabled = true

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Create user in our users table
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: data.user.email,
          is_admin: false,
        },
      ])

      if (insertError) {
        throw insertError
      }

      // Redirect to home page
      window.location.href = "index.html"
    } catch (error) {
      console.error("Registration error:", error)
      errorMessage.textContent = error.message || "Failed to register. Please try again."
      errorMessage.style.display = "block"

      // Reset button
      if (submitBtn) {
        submitBtn.textContent = originalBtnText
        submitBtn.disabled = false
      }
    }
  })
}
