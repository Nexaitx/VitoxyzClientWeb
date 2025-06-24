import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // For user feedback

// Define the structure of a chat message
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}


@Component({
  selector: 'app-meera-ai',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './meera-ai.html',
  styleUrls: ['./meera-ai.scss']
})
export class MeeraAi implements OnInit, OnDestroy {
  userInput: string = '';
  messages: { text: string, isUser: boolean }[] = [
    { text: 'Hello! How can I assist you today?', isUser: false }
  ];
  isListening: boolean = false;
  private recognition: any;

  constructor(private snackBar: MatSnackBar) {
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

      this.recognition.onerror = (event: any) => {
        this.snackBar.open('Speech recognition error: ' + event.error, 'Close', { duration: 3000 });
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      this.snackBar.open('Speech recognition not supported in this browser.', 'Close', { duration: 3000 });
    }
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  onInputChange() {
    // No additional logic needed here, but included for potential future use
  }

  toggleSpeechRecognition() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else if (this.recognition) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  sendMessage() {
    if (this.userInput.trim()) {
      this.messages.push({ text: this.userInput, isUser: true });
      const botResponse = this.getBotResponse(this.userInput.toLowerCase());
      setTimeout(() => {
        this.messages.push({ text: botResponse, isUser: false });
      }, 500);
      this.userInput = '';
      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      }
    }
  }

  private getBotResponse(input: string): string {
    if (input.includes('hello') || input.includes('hi')) {
      return 'Hey👋 there! How can I help you? ';
    } else if (input.includes('how are you')) {
      return 'Doing great👍, thanks for asking❤️! How about you?';
    } else if (input.includes('bye') || input.includes('goodbye')) {
      return 'See you later!👋';
    } else {
      return "Sorry, I didn't quite get that. Try asking something else!";
    }
  }
}