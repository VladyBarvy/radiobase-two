// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// //const SQLiteDatabase = require('./database');
// const SimpleDatabase = require('./database');

// let mainWindow;
// let db;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: path.join(__dirname, 'preload.js')
//     }
//   });

//   mainWindow.loadFile('index.html');
// }

// app.whenReady().then(async () => {
//   try {
//     db = new SimpleDatabase();
//     await db.initialize();
    
//     // Добавляем тестовые категории при первом запуске
//     const categories = db.getCategories();
//     if (categories.length === 0) {
//       db.addTestCategories();
//     }
    
//     createWindow();
//   } catch (error) {
//     console.error('Ошибка инициализации БД:', error);
//   }

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });


// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });

// // IPC обработчики
// ipcMain.handle('get-categories', () => {
//   const stmt = db.prepare(`
//     WITH RECURSIVE category_tree AS (
//       SELECT id, name, parent_id, type, 0 as level
//       FROM categories 
//       WHERE parent_id IS NULL
//       UNION ALL
//       SELECT c.id, c.name, c.parent_id, c.type, ct.level + 1
//       FROM categories c
//       INNER JOIN category_tree ct ON c.parent_id = ct.id
//     )
//     SELECT * FROM category_tree ORDER BY level, name
//   `);
//   return stmt.all();
// });

// ipcMain.handle('add-category', (event, category) => {
//   const stmt = db.prepare(`
//     INSERT INTO categories (name, parent_id, type) 
//     VALUES (?, ?, ?)
//   `);
//   const result = stmt.run(category.name, category.parentId, category.type);
//   return { id: result.lastInsertRowid, ...category };
// });

// ipcMain.handle('delete-category', (event, id) => {
//   // Проверяем, есть ли дочерние категории или компоненты
//   const checkChildren = db.prepare('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?');
//   const checkComponents = db.prepare('SELECT COUNT(*) as count FROM components WHERE category_id = ?');
  
//   const childrenCount = checkChildren.get(id).count;
//   const componentsCount = checkComponents.get(id).count;
  
//   if (childrenCount > 0 || componentsCount > 0) {
//     throw new Error('Нельзя удалить категорию с дочерними элементами');
//   }
  
//   const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
//   return stmt.run(id);
// });

// ipcMain.handle('get-components', (event, categoryId) => {
//   const stmt = db.prepare(`
//     SELECT c.*, cat.name as category_name 
//     FROM components c 
//     LEFT JOIN categories cat ON c.category_id = cat.id 
//     WHERE c.category_id = ?
//     ORDER BY c.name
//   `);
//   return stmt.all(categoryId);
// });

// ipcMain.handle('get-component', (event, id) => {
//   const stmt = db.prepare('SELECT * FROM components WHERE id = ?');
//   const component = stmt.get(id);
//   if (component && component.parameters) {
//     component.parameters = JSON.parse(component.parameters);
//   }
//   return component;
// });

// ipcMain.handle('save-component', (event, component) => {
//   const now = new Date().toISOString();
//   let stmt;
  
//   if (component.id) {
//     stmt = db.prepare(`
//       UPDATE components 
//       SET name = ?, description = ?, category_id = ?, manufacturer = ?, 
//           part_number = ?, parameters = ?, datasheet_url = ?, stock_quantity = ?,
//           updated_at = ?
//       WHERE id = ?
//     `);
//     stmt.run(
//       component.name,
//       component.description,
//       component.category_id,
//       component.manufacturer,
//       component.part_number,
//       JSON.stringify(component.parameters || {}),
//       component.datasheet_url,
//       component.stock_quantity,
//       now,
//       component.id
//     );
//     return { ...component, updated_at: now };
//   } else {
//     stmt = db.prepare(`
//       INSERT INTO components 
//       (name, description, category_id, manufacturer, part_number, parameters, datasheet_url, stock_quantity)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     `);
//     const result = stmt.run(
//       component.name,
//       component.description,
//       component.category_id,
//       component.manufacturer,
//       component.part_number,
//       JSON.stringify(component.parameters || {}),
//       component.datasheet_url,
//       component.stock_quantity
//     );
//     return { 
//       id: result.lastInsertRowid, 
//       ...component, 
//       created_at: now, 
//       updated_at: now 
//     };
//   }
// });

// ipcMain.handle('delete-component', (event, id) => {
//   const stmt = db.prepare('DELETE FROM components WHERE id = ?');
//   return stmt.run(id);
// });

// ipcMain.handle('get-component-types', () => {
//   const stmt = db.prepare('SELECT * FROM component_types');
//   const types = stmt.all();
//   return types.map(type => ({
//     ...type,
//     parameters_schema: JSON.parse(type.parameters_schema)
//   }));
// });

// ipcMain.handle('search-components', (event, query) => {
//   const stmt = db.prepare(`
//     SELECT c.*, cat.name as category_name 
//     FROM components c 
//     LEFT JOIN categories cat ON c.category_id = cat.id 
//     WHERE c.name LIKE ? OR c.part_number LIKE ? OR c.manufacturer LIKE ? OR c.description LIKE ?
//     ORDER BY c.name
//   `);
//   const searchPattern = `%${query}%`;
//   return stmt.all(searchPattern, searchPattern, searchPattern, searchPattern);
// });












































// main.js
// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// const SimpleDB = require('./database-simple');

// let mainWindow;
// let db;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: path.join(__dirname, 'preload.js')
//     }
//   });

//   mainWindow.loadFile('index.html');
// }

// app.whenReady().then(() => {
//   db = new SimpleDB();
//   db.init();
//   createWindow();

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });

// // Простые IPC обработчики
// ipcMain.handle('get-categories', () => db.getCategories());
// ipcMain.handle('get-component-types', () => db.getComponentTypes());
// ipcMain.handle('get-components', (event, categoryId) => db.getComponents(categoryId));

























const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const SimpleDB = require('./database-simple');

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  console.log('Main process starting...');
  db = new SimpleDB();
  db.init();
  console.log('Database initialized');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Полный набор IPC обработчиков
ipcMain.handle('get-categories', () => {
  console.log('IPC: get-categories');
  return db.getCategories();
});

ipcMain.handle('add-category', async (event, category) => {
  console.log('IPC: add-category', category);
  try {
    const result = await db.addCategory(category);
    return result;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
});

ipcMain.handle('delete-category', async (event, id) => {
  console.log('IPC: delete-category', id);
  try {
    const result = await db.deleteCategory(id);
    return result;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
});

ipcMain.handle('get-components', (event, categoryId) => {
  console.log('IPC: get-components', categoryId);
  return db.getComponents(categoryId);
});

ipcMain.handle('get-component', (event, id) => {
  console.log('IPC: get-component', id);
  return db.getComponent(id);
});

ipcMain.handle('save-component', async (event, component) => {
  console.log('IPC: save-component', component);
  try {
    const result = await db.saveComponent(component);
    console.log('Save component result:', result);
    return result;
  } catch (error) {
    console.error('Error saving component:', error);
    throw error;
  }
});

ipcMain.handle('delete-component', async (event, id) => {
  console.log('IPC: delete-component', id);
  try {
    const result = await db.deleteComponent(id);
    return result;
  } catch (error) {
    console.error('Error deleting component:', error);
    throw error;
  }
});

ipcMain.handle('get-component-types', () => {
  console.log('IPC: get-component-types');
  return db.getComponentTypes();
});

ipcMain.handle('search-components', (event, query) => {
  console.log('IPC: search-components', query);
  return db.searchComponents(query);
});
