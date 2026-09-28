// Retrieve user data to display on account settings page
async function loadProfile() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch('/api/v2/profile', {
      credentials: 'include',
      signal: controller.signal
    })
    if (!response.ok) throw new Error(response.statusText)
    const data = await response.json()
    if (!data || !data.user) return

    const display = (userData, dataId, dataName) => {
      const el = document.getElementById(dataId)
      if (userData) {
        el.textContent = `${dataName}: ${userData}`
      } else {
        el.textContent = `${dataName}: Add details`
      }
    }

    display(data.user.name, 'name', 'Name')
    document.querySelector('#email').textContent = `Email: ${data.user.email}`
  } catch (err) {
    console.error('Failed to load profile:', err)
    message1.textContent = 'ERROR!'
    message2.textContent = 'Unable to load profile'
  } finally {
    clearTimeout(timer)
  }
}

loadProfile()