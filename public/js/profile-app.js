// Client-Side Profile code for the REST API

const apiUrl = ''
const profileForm = document.querySelector('#profile-form')
var userProfile = {}
hookMessageTags()

// ---- helpers ----
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

document.addEventListener('DOMContentLoaded', handlerDomLoaded)
profileForm.addEventListener('submit', handleSubmitForm)
document.querySelector('#delete').addEventListener('click', handleDeleteProfile)

async function handlerDomLoaded() {
  try {
    const response = await fetchWithTimeout(apiUrl + '/api/v2/profile', {
      credentials: 'include'
    })
    if (response.ok) {
      userProfile = await response.json()
    } else {
      throw new Error(`Failed to retrieve Profile data! ${response.statusText} - ${response.status}`)
    }
  } catch (err) {
    message1.textContent = 'ERROR!'
    message2.textContent = err.message || err
    message3.textContent = "Unable to GET User Profile! Logout and Login then try again!"
    throw new Error(message3.textContent)
  }

  if (Object.keys(userProfile).length > 0) {
    document.querySelector('#name').value = userProfile.user.name
    document.querySelector('#email').value = userProfile.user.email
    document.querySelector('#age').value = userProfile.user.age
  }
}

async function handleSubmitForm(event) {
  event.preventDefault()
  clearMessages()
  let formData = getFormData(profileForm, true)
  let result = null

  removeEmptyProperties(formData)
  let updateEmailCookie = getCookie('task_manager_email') == userProfile.user.email

  try {
    const response = await fetchWithTimeout(apiUrl + '/api/v2/users/me', {
      credentials: 'include',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    result = await response.json()
    if (!response.ok) {
      throw new Error(`Failure Updating User Profile! ${response.statusText} - ${response.status}`)
    }
  } catch (err) {
    message1.textContent = 'ERROR!'
    message2.textContent = (err.message || err) + (result && result.error ? ' ' + result.error : '')
    message3.textContent = "Unable to PATCH User Profile! Check name, email, password, or age and try again!"
    throw new Error(message3.textContent)
  }

  message1.textContent = 'SUCCESS!'
  message2.textContent = 'Updated your User Profile'
  if (updateEmailCookie) { setCookie('task_manager_email', result.email) }
}

async function handleLogoutAll(event) {
  clearMessages()
  try {
    const response = await fetchWithTimeout(apiUrl + '/api/v2/users/logoutAll', {
      credentials: 'include',
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error(`Failed to logout all Sessions! ${response.statusText} - ${response.status}`)
    }
    message1.textContent = 'SUCCESS!'
    message2.textContent = 'All your Sessions have been logged out'
    message3.textContent = 'You will be returned to the login page in 3 seconds'
    setCookie('task_manager_auth_token', 'deleted', -1)
    setTimeout(() => {
      window.location.href = "login.html"
    }, 3000)
  } catch (err) {
    message1.textContent = 'ERROR!'
    message2.textContent = err.message || err
    message3.textContent = 'Unable to POST logout all Sessions!'
    throw new Error(message3.textContent)
  }
}

async function handleDeleteProfile(event) {
  clearMessages()

  let confirm = window.confirm("Click OK to delete your Profile")
  if (!confirm) { return; }

  try {
    const response = await fetchWithTimeout(apiUrl + '/api/v2/users/me', {
      credentials: 'include',
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`Failed to delete Profile! ${response.statusText} - ${response.status}`)
    }
    setCookie('auth_token', 'deleted', -1)
    setCookie('task_manager_auth_token', 'deleted', -1)
    message1.textContent = 'SUCCESS!'
    message2.textContent = 'Your Profile has been deleted'
    message3.textContent = 'You will be returned to the main page in 3 seconds'
    setTimeout(() => {
      window.location.href = "login.html"
    }, 3000)
  } catch (err) {
    message1.textContent = 'ERROR!'
    message2.textContent = err.message || err
    message3.textContent = 'Unable to DELETE Profile!'
    throw new Error(message3.textContent)
  }
}