import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  newText = '';
   priority = 'Low'; // ✅ ADD THIS

@Output() close = new EventEmitter<void>();

  closeBox(){
    this.close.emit();
  }
@Output() add = new EventEmitter<string>();
  addTodo() {
  const text = this.newText.trim();
  if (text === '') return;

  this.add.emit(`${text}||${this.priority}`); // ✅ make sure this line exists
  this.newText = '';
  this.priority = 'Low';
  this.close.emit();
}
}

