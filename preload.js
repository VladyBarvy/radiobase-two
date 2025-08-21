// // preload.js
// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electronAPI', {
//   // Категории
//   getCategories: () => ipcRenderer.invoke('get-categories'),
//   addCategory: (category) => ipcRenderer.invoke('add-category', category),
//   deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),
  
//   // Компоненты
//   getComponents: (categoryId) => ipcRenderer.invoke('get-components', categoryId),
//   getComponent: (id) => ipcRenderer.invoke('get-component', id),
//   saveComponent: (component) => ipcRenderer.invoke('save-component', component),
//   deleteComponent: (id) => ipcRenderer.invoke('delete-component', id),
  
//   // Типы компонентов
//   getComponentTypes: () => ipcRenderer.invoke('get-component-types'),
  
//   // Поиск
//   searchComponents: (query) => ipcRenderer.invoke('search-components', query)
// });























// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Категории
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),
  
  // Компоненты
  getComponents: (categoryId) => ipcRenderer.invoke('get-components', categoryId),
  getComponent: (id) => ipcRenderer.invoke('get-component', id),
  saveComponent: (component) => ipcRenderer.invoke('save-component', component),
  deleteComponent: (id) => ipcRenderer.invoke('delete-component', id),
  
  // Типы компонентов
  getComponentTypes: () => ipcRenderer.invoke('get-component-types'),
  
  // Поиск
  searchComponents: (query) => ipcRenderer.invoke('search-components', query)
});
