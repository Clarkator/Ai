class AIDoctorAssistant {
  constructor() {
    this.chatHistory = []
    this.isLoading = false
    this.initializeElements()
    this.bindEvents()
    this.updateUI()
  }

  initializeElements() {
    this.apiKeyInput = document.getElementById("apiKey")
    this.messageInput = document.getElementById("messageInput")
    this.sendBtn = document.getElementById("sendBtn")
    this.chatMessages = document.getElementById("chatMessages")
    this.chatForm = document.getElementById("chatForm")
    this.clearBtn = document.getElementById("clearChat")
    this.togglePassword = document.getElementById("togglePassword")
    this.toggleSettings = document.getElementById("toggleSettings")
    this.settingsContent = document.getElementById("settingsContent")
  }

  bindEvents() {
    this.chatForm.addEventListener("submit", (e) => this.handleSubmit(e))
    this.apiKeyInput.addEventListener("input", () => this.updateUI())
    this.clearBtn.addEventListener("click", () => this.clearChat())
    this.togglePassword.addEventListener("click", () => this.togglePasswordVisibility())
    this.toggleSettings.addEventListener("click", () => this.toggleSettingsPanel())

    // Enter key to send message
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.handleSubmit(e)
      }
    })
  }

  updateUI() {
    const hasApiKey = this.apiKeyInput.value.trim().length > 0
    const hasMessage = this.messageInput.value.trim().length > 0

    this.messageInput.disabled = !hasApiKey || this.isLoading
    this.sendBtn.disabled = !hasApiKey || !hasMessage || this.isLoading
    this.clearBtn.disabled = this.chatHistory.length === 0

    if (hasApiKey) {
      this.messageInput.placeholder = "Ask your AI doctor about symptoms or health concerns..."
    } else {
      this.messageInput.placeholder = "Please enter your API key to consult with your AI doctor"
    }
  }

  togglePasswordVisibility() {
    const isPassword = this.apiKeyInput.type === "password"
    this.apiKeyInput.type = isPassword ? "text" : "password"
    this.togglePassword.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>'
  }

  toggleSettingsPanel() {
    const isHidden = this.settingsContent.classList.contains("hidden")

    if (isHidden) {
      this.settingsContent.classList.remove("hidden")
      this.toggleSettings.classList.remove("collapsed")
    } else {
      this.settingsContent.classList.add("hidden")
      this.toggleSettings.classList.add("collapsed")
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    const message = this.messageInput.value.trim()
    const apiKey = this.apiKeyInput.value.trim()

    if (!message || !apiKey || this.isLoading) return

    // Add user message to chat
    this.addMessage("user", message)
    this.messageInput.value = ""
    this.updateUI()

    // Show loading indicator
    this.showLoading()

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          api_key: apiKey,
          chat_history: this.chatHistory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      // Add assistant response to chat
      this.addMessage("assistant", data.response)
    } catch (error) {
      console.error("Error:", error)
      this.addMessage(
        "assistant",
        `I apologize, but I'm having trouble connecting to the AI doctor service. Error: ${error.message}. Please check your API key and try again. If this is a medical emergency, please contact emergency services immediately.`,
      )
    } finally {
      this.hideLoading()
      this.updateUI()
    }
  }

  addMessage(role, content) {
    const message = {
      id: Date.now().toString(),
      role: role,
      content: content,
      timestamp: new Date(),
    }

    this.chatHistory.push(message)
    this.renderMessage(message)
    this.scrollToBottom()

    // Hide welcome message if it exists
    const welcomeMessage = this.chatMessages.querySelector(".welcome-message")
    if (welcomeMessage) {
      welcomeMessage.style.display = "none"
    }
  }

  renderMessage(message) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${message.role}`

    const roleIcon = message.role === "user" ? "fas fa-user" : "fas fa-user-md"
    const roleLabel = message.role === "user" ? "You" : "AI Doctor"

    messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <i class="${roleIcon}"></i>
                    <strong>${roleLabel}</strong>
                </div>
                <div class="message-text">${this.escapeHtml(message.content)}</div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `

    this.chatMessages.appendChild(messageDiv)
  }

  showLoading() {
    this.isLoading = true
    const loadingDiv = document.createElement("div")
    loadingDiv.className = "loading-message"
    loadingDiv.id = "loadingMessage"
    loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
                <span>Your AI doctor is analyzing...</span>
            </div>
        `

    this.chatMessages.appendChild(loadingDiv)
    this.scrollToBottom()
  }

  hideLoading() {
    this.isLoading = false
    const loadingMessage = document.getElementById("loadingMessage")
    if (loadingMessage) {
      loadingMessage.remove()
    }
  }

  clearChat() {
    this.chatHistory = []
    this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-content">
                    <i class="fas fa-heartbeat welcome-icon"></i>
                    <h3>Welcome to Your AI Doctor!</h3>
                    <p>I'm your personal AI doctor here to help with health questions, symptom analysis, and medical guidance.</p>
                    <div class="health-features">
                        <div class="feature">
                            <i class="fas fa-search-plus"></i>
                            <span>Symptom Analysis</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-pills"></i>
                            <span>Medication Info</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-heart"></i>
                            <span>Wellness Tips</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-phone-alt"></i>
                            <span>When to See a Doctor</span>
                        </div>
                    </div>
                    <p class="start-prompt">Enter your API key above and start consulting with your AI doctor</p>
                </div>
            </div>
        `
    this.updateUI()
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize the AI doctor when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new AIDoctorAssistant()
})
