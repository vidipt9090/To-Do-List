import { Component, signal , computed} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './home/home';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Home, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

   // CHANGED: Removed newTodo signal (search bar should have its own separate signal)
  searchText = signal(''); // CHANGED: renamed to searchText for clarity

  todos = signal<{text:string, done: boolean}[]>([]); // NO CHANGE

  // CHANGED: addTodo now accepts text from home component instead of reading from signal
  addTodo(text: string) {
    if (text.trim() === '') return;
    this.todos.update(list => [...list, { text, done: false }]);
    // CHANGED: No need to clear any signal here, home.ts handles that
  }

  // NO CHANGE
  toggleTodo(index: number) {
  const actualIndex = this.todos().indexOf(this.filteredTodos()[index]); // ✅ CHANGED
  this.todos.update(list =>
    list.map((item, i) =>
      i === actualIndex ? { ...item, done: !item.done } : item
    )
  );
}

  // NO CHANGE
  deletedTodo(index: number) {
  const actualIndex = this.todos().indexOf(this.filteredTodos()[index]); // ✅ CHANGED
  this.todos.update(
    list => list.filter((_, i) => i !== actualIndex)
  );
}
editTodo(index: number) {
  const actualIndex = this.todos().indexOf(this.filteredTodos()[index]); // ✅ CHANGED
  const newText = prompt('Edit your note:', this.todos()[actualIndex].text);
  if (newText && newText.trim() !== '') {
    this.todos.update(list =>
      list.map((item, i) =>
        i === actualIndex ? { ...item, text: newText.trim() } : item
      )
    );
  }
}

  // NO CHANGE - Dark Mode
  isDarkMode = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  // NO CHANGE - Modal
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // Dropdown Logic
  filterMode = signal<'ALL' | 'Completed' | 'Pending'>('ALL');

filteredTodos = computed(() => {
  const mode = this.filterMode();
  const search = this.searchText().toLowerCase().trim();
  let all = this.todos();
  if (search) {
    all = all.filter(t => t.text.toLowerCase().includes(search));
  }
  if (mode === 'Completed') return all.filter(t => t.done);
  if (mode === 'Pending') return all.filter(t => !t.done);
  return all;
});
}

