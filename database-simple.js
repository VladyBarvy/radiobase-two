// // database-simple.js
// const fs = require('fs');
// const path = require('path');
// const { app } = require('electron');

// class SimpleDB {
//   constructor() {
//     this.dbPath = path.join(app.getPath('userData'), 'components.json');
//     this.data = { categories: [], components: [], component_types: [] };
//   }

//   init() {
//     try {
//       if (fs.existsSync(this.dbPath)) {
//         this.data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
//       } else {
//         this.addDefaultData();
//         this.save();
//       }
//     } catch (error) {
//       console.error('DB init error:', error);
//     }
//   }

//   save() {
//     try {
//       fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
//     } catch (error) {
//       console.error('DB save error:', error);
//     }
//   }

//   addDefaultData() {
//     this.data.component_types = [
//       {
//         id: 1,
//         name: 'Резистор',
//         parameters_schema: { сопротивление: 'number', мощность: 'number' }
//       },
//       {
//         id: 2, 
//         name: 'Конденсатор',
//         parameters_schema: { емкость: 'number', напряжение: 'number' }
//       }
//     ];

//     this.data.categories = [
//       { id: 1, name: 'Резисторы', parent_id: null, type: 'Резистор' },
//       { id: 2, name: 'Конденсаторы', parent_id: null, type: 'Конденсатор' }
//     ];
//   }

//   // Простые методы доступа к данным
//   getCategories() { return this.data.categories; }
//   getComponentTypes() { return this.data.component_types; }
//   getComponents(categoryId) { 
//     return this.data.components.filter(c => c.category_id === categoryId); 
//   }
// }

// module.exports = SimpleDB;






















// database-simple.js
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class SimpleDB {
  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'components.json');
    this.data = { categories: [], components: [], component_types: [] };
  }

  init() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileData = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileData);
        console.log('Database loaded from file');
      } else {
        this.addDefaultData();
        this.save();
        console.log('New database created with default data');
      }
    } catch (error) {
      console.error('DB init error:', error);
      // Создаем пустую структуру в случае ошибки
      this.data = { categories: [], components: [], component_types: [] };
      this.addDefaultData();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
      console.log('Database saved');
    } catch (error) {
      console.error('DB save error:', error);
    }
  }

  addDefaultData() {
    // Типы компонентов
    this.data.component_types = [
      {
        id: 1,
        name: 'Резистор',
        parameters_schema: { 
          сопротивление: 'number', 
          мощность: 'number',
          допуск: 'number',
          температурный_коэффициент: 'string'
        }
      },
      {
        id: 2, 
        name: 'Конденсатор',
        parameters_schema: { 
          емкость: 'number', 
          напряжение: 'number',
          допуск: 'number',
          тип: 'string'
        }
      },
      {
        id: 3,
        name: 'Транзистор',
        parameters_schema: {
          тип: 'string',
          максимальное_напряжение: 'number',
          максимальный_ток: 'number',
          коэффициент_усиления: 'number'
        }
      },
      {
        id: 4,
        name: 'Микросхема',
        parameters_schema: {
          назначение: 'string',
          напряжение_питания: 'number',
          количество_выводов: 'number',
          корпус: 'string'
        }
      },
      {
        id: 5,
        name: 'Диод',
        parameters_schema: {
          тип: 'string',
          максимальное_обратное_напряжение: 'number',
          максимальный_прямой_ток: 'number'
        }
      }
    ];

    // Категории
    this.data.categories = [
      { id: 1, name: 'Пассивные компоненты', parent_id: null, type: 'Категория' },
      { id: 2, name: 'Активные компоненты', parent_id: null, type: 'Категория' },
      { id: 3, name: 'Резисторы', parent_id: 1, type: 'Резистор' },
      { id: 4, name: 'Конденсаторы', parent_id: 1, type: 'Конденсатор' },
      { id: 5, name: 'Транзисторы', parent_id: 2, type: 'Транзистор' },
      { id: 6, name: 'Диоды', parent_id: 2, type: 'Диод' },
      { id: 7, name: 'Микросхемы', parent_id: 2, type: 'Микросхема' }
    ];

    // Несколько тестовых компонентов
    this.data.components = [
      {
        id: 1,
        name: 'Резистор 1кОм',
        description: 'Углеродный резистор 1кОм 0.25Вт',
        category_id: 3,
        manufacturer: 'XYZ Electronics',
        part_number: 'R-1K-0.25W',
        parameters: { сопротивление: 1000, мощность: 0.25, допуск: 5 },
        datasheet_url: '',
        stock_quantity: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Конденсатор 100нФ',
        description: 'Керамический конденсатор 100нФ 50В',
        category_id: 4,
        manufacturer: 'ABC Components',
        part_number: 'C-100n-50V',
        parameters: { емкость: 0.0000001, напряжение: 50, допуск: 10 },
        datasheet_url: '',
        stock_quantity: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Методы для работы с категориями
  getCategories() { 
    return this.data.categories; 
  }

  async addCategory(category) {
    const newCategory = {
      id: Date.now(),
      name: category.name,
      parent_id: category.parentId || null,
      type: category.type || 'Категория',
      created_at: new Date().toISOString()
    };
    
    this.data.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  async deleteCategory(id) {
    // Проверяем дочерние категории
    const hasChildren = this.data.categories.some(cat => cat.parent_id === id);
    
    // Проверяем компоненты
    const hasComponents = this.data.components.some(comp => comp.category_id === id);
    
    if (hasChildren || hasComponents) {
      throw new Error('Нельзя удалить категорию с дочерними элементами');
    }
    
    this.data.categories = this.data.categories.filter(cat => cat.id !== id);
    this.save();
    return true;
  }

  // Методы для работы с компонентами
  getComponents(categoryId) { 
    let components = this.data.components;
    if (categoryId) {
      components = components.filter(c => c.category_id === categoryId);
    }
    
    // Добавляем название категории для каждого компонента
    return components.map(comp => ({
      ...comp,
      category_name: this.getCategoryName(comp.category_id)
    }));
  }

  getCategoryName(categoryId) {
    const category = this.data.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Неизвестная категория';
  }

  getComponent(id) {
    const component = this.data.components.find(comp => comp.id === id);
    if (component) {
      return {
        ...component,
        category_name: this.getCategoryName(component.category_id)
      };
    }
    return null;
  }

  async saveComponent(component) {
    const now = new Date().toISOString();
    
    if (component.id) {
      // Обновление существующего компонента
      const index = this.data.components.findIndex(c => c.id === component.id);
      if (index !== -1) {
        this.data.components[index] = {
          ...this.data.components[index],
          ...component,
          updated_at: now
        };
      }
    } else {
      // Создание нового компонента
      const newComponent = {
        id: Date.now(),
        name: component.name || '',
        description: component.description || '',
        category_id: component.category_id,
        manufacturer: component.manufacturer || '',
        part_number: component.part_number || '',
        parameters: component.parameters || {},
        datasheet_url: component.datasheet_url || '',
        stock_quantity: component.stock_quantity || 0,
        created_at: now,
        updated_at: now
      };
      this.data.components.push(newComponent);
    }
    
    this.save();
    return component;
  }

  async deleteComponent(id) {
    this.data.components = this.data.components.filter(comp => comp.id !== id);
    this.save();
    return true;
  }

  getComponentTypes() { 
    return this.data.component_types; 
  }

  searchComponents(query) {
    if (!query) return this.getComponents();
    
    const searchTerm = query.toLowerCase();
    return this.data.components.filter(comp => 
      comp.name.toLowerCase().includes(searchTerm) ||
      (comp.part_number && comp.part_number.toLowerCase().includes(searchTerm)) ||
      (comp.manufacturer && comp.manufacturer.toLowerCase().includes(searchTerm)) ||
      (comp.description && comp.description.toLowerCase().includes(searchTerm))
    ).map(comp => ({
      ...comp,
      category_name: this.getCategoryName(comp.category_id)
    }));
  }
}

module.exports = SimpleDB;
