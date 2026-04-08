import { Component, signal , computed, effect} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './home/home';
import { CommonModule } from '@angular/common';
import { auth , db  } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Login } from './login/login';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  doc,
  query,
  where
} from 'firebase/firestore';

@Component({
  selector: 'app-root',
  imports: [Home, CommonModule, Login],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  searchText = signal('');
  isLoggedIn = false;//for authentication state
  userId = ''; // ✅ ADD after isLoggedIn
  // loading todos to a local storage and retrieving them on app initialization
  //
  todos = signal<{
    id: string,
    text: string,
    done: boolean,
    createdAt: string,
    priority: string
  }[]>([]);

  // CHANGED: addTodo now accepts text from home component instead of reading from signal
  loadTodos() {
  const q = query(
    collection(db, 'todos'),
    where('userId', '==', this.userId)
  );
  onSnapshot(q, (snapshot) => {
    const loaded = snapshot.docs.map(doc => ({
      id: doc.id, ...doc.data()
    })) as any[];
    this.todos.set(loaded);
  });
}
  async addTodo(data: string) {
  // ✅ CHANGED: added fallback if priority is missing
  const parts = data.split('||');
  const text = parts[0];
  const priority = parts[1] ?? 'Low'; // ✅ default to 'Low' if undefined

  if (text.trim() === '') return;

  const now = new Date();
  const createdAt = now.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });

   await addDoc(collection(db, 'todos'), {
    text: text.trim(),
    done: false,
    createdAt,
    priority,  // ✅ now always has a value
    userId: this.userId
  });
}
 toggleTodo(index: number) {
  const actualIndex = this.todos().indexOf(this.filteredTodos()[index]);
  const isDone = this.todos()[actualIndex].done;

  // ✅ ADD: play sound only when marking as COMPLETE
  if (!isDone) {
    this.playCompleteSound();
  }

  this.todos.update(list =>
    list.map((item, i) =>
      i === actualIndex ? { ...item, done: !item.done } : item
    )
  );
}
  async deletedTodo(index: number) {
  const todo = this.filteredTodos()[index];
  await deleteDoc(doc(db, 'todos', todo.id));
}

async editTodo(index: number) {
  const todo = this.filteredTodos()[index];
  const newText = prompt('Edit your note:', todo.text);
  if (newText && newText.trim() !== '') {
    await updateDoc(doc(db, 'todos', todo.id), {
      text: newText.trim()
    });
  }
}

  // Dark Mode
  isDarkMode = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const btn = document.querySelector('.darkmode');
    if (btn) {
    btn.classList.add('spin');
    setTimeout(() => btn.classList.remove('spin'), 500);
  }
  }

  //  Modal
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // Dropdown Logic
  filterMode = signal<'ALL' | 'Completed' | 'Pending'>('Pending');

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

//  Date ANnd Time Logic
currentDate = signal('');
currentTime = signal('');

constructor() {
  // Authentication state listener
  onAuthStateChanged(auth, (user) => {
  this.isLoggedIn = !!user;
  if (user) {
    this.userId = user.uid;
    this.loadTodos(); // ✅ ADD
  } else {
    this.userId = '';
    this.todos.set([]); // ✅ ADD
  }
});
  this.updateDateTime();
  setInterval(() => this.updateDateTime(), 1000); // updates every second

    effect(() => {
    localStorage.setItem('todos', JSON.stringify(this.todos()));
  });
}

updateDateTime() {
  const now = new Date();

  this.currentDate.set(now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  this.currentTime.set(now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));
}
// NO CHANGE - Pending Count
pendingCount = computed(() => this.todos().filter(t => !t.done).length);

//
async logout(){
  await signOut(auth);
}

// Drag And Drop Logic
dragIndex: number | null = null;
dragOverIndex: number | null = null;

// ✅ ADD these methods
onDragStart(index: number) {
  this.dragIndex = index;
}

onDragOver(event: DragEvent, index: number) {
  event.preventDefault();
  this.dragOverIndex = index;
}

onDrop(index: number) {
  if (this.dragIndex === null || this.dragIndex === index) return;

  this.todos.update(list => {
    const updated = [...list];
    const [moved] = updated.splice(this.dragIndex!, 1);
    updated.splice(index, 0, moved);
    return updated;
  });

  this.dragIndex = null;
  this.dragOverIndex = null;
}

onDragEnd() {
  this.dragIndex = null;
  this.dragOverIndex = null;
}

// Sound Effect

// ✅ ADD this method
playCompleteSound() {
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  // 🎵 Pleasant "ding" sound
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(900, context.currentTime + 0.1);
  oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.3);

  gainNode.gain.setValueAtTime(0.3, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
}
// ✅ ADD this computed
completionPercent = computed(() => {
  const total = this.todos().length;
  if (total === 0) return 0;
  const done = this.todos().filter(t => t.done).length;
  return Math.round((done / total) * 100);
});

}

