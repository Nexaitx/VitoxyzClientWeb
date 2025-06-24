import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface ChatMessage {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-support',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './support.html',
  styleUrl: './support.scss'
})
export class Support  implements AfterViewInit {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  messages: ChatMessage[] = [
    { text: 'Hello! How can I assist you today?', isUser: false }
  ];
  userInput: string = '';
  isListening: boolean = false;
  private recognition: any;

  constructor() {
    // Initialize Web Speech API if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userInput = transcript;
        this.sendMessage();
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  onInputChange() {
    // Triggered on input change, can be used for additional logic if needed
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ text: this.userInput, isUser: true });
      this.getBotResponse(this.userInput);
      this.userInput = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  toggleSpeechRecognition() {
    if (!this.recognition) {
      this.messages.push({ text: 'Speech recognition is not supported in this browser.', isUser: false });
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.isListening = true;
      this.recognition.start();
    }
  }

  private getBotResponse(userMessage: string) {
    // Mock bot response logic
    let botReply = 'I’m here to help! Could you provide more details?';
    if (userMessage.toLowerCase().includes('issue') || userMessage.toLowerCase().includes('problem')) {
      botReply = 'Sorry to hear you’re having an issue. Please describe the problem in detail, and I’ll guide you through troubleshooting.';
    } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      botReply = 'Hi there! How can I assist you today?';
    } else if (userMessage.toLowerCase().includes('account')) {
      botReply = 'For account-related queries, please provide your account ID or email, and I’ll check the status for you.';
    }

    setTimeout(() => {
      this.messages.push({ text: botReply, isUser: false });
      this.scrollToBottom();
    }, 1000); // Simulate network delay
  }

  private scrollToBottom() {
    if (this.chatMessages) {
      const chatContainer = this.chatMessages.nativeElement;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
}
