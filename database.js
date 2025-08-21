// database.js
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class SimpleDatabase {
  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'components.json');
    this.data = null;
  }

  async initialize() {
    try {
      // Проверяем существование файла БД
      if (fs.existsSync(this.dbPath)) {
        const fileData = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileData);
      } else {
        // Создаем новую базу данных с тестовыми данными
        this.data = {
          categories: [],
          components: [],
          component_types: [
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
            },
            {
              id: 6,
              name: 'Индуктивность',
              parameters_schema: {
                индуктивность: 'number',
                максимальный_ток: 'number',
                сопротивление_потерь: 'number'
              }
            }
          ]
        };
        
        // Добавляем тестовые категории
        this.addTestCategories();
        await this.save();
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка инициализации БД:', error);
      // Создаем пустую базу в случае ошибки
      this.data = { categories: [], components: [], component_types: [] };
      return true;
    }
  }

  async save() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Ошибка сохранения БД:', error);
    }
  }

  // Категории
  getCategories() {
    return this.data?.categories || [];
  }

  async addCategory(category) {
    const newCategory = {
      id: Date.now(),
      name: category.name,
      parent_id: category.parentId || null,
      type: category.type,
      created_at: new Date().toISOString()
    };
    
    this.data.categories.push(newCategory);
    await this.save();
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
    await this.save();
    return true;
  }

  // Компоненты
  getComponents(categoryId = null) {
    let components = this.data?.components || [];
    
    if (categoryId) {
      components = components.filter(comp => comp.category_id === categoryId);
    }
    
    // Добавляем названия категорий
    return components.map(comp => ({
      ...comp,
      category_name: this.getCategoryName(comp.category_id)
    }));
  }

  getCategoryName(categoryId) {
    const category = this.data.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Неизвестно';
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
        ...component,
        created_at: now,
        updated_at: now
      };
      this.data.components.push(newComponent);
    }
    
    await this.save();
    return component;
  }

  async deleteComponent(id) {
    this.data.components = this.data.components.filter(comp => comp.id !== id);
    await this.save();
    return true;
  }

  getComponentTypes() {
    return this.data?.component_types || [];
  }

  searchComponents(query) {
    const searchTerm = query.toLowerCase();
    const components = this.getComponents();
    
    return components.filter(comp => 
      comp.name.toLowerCase().includes(searchTerm) ||
      (comp.part_number && comp.part_number.toLowerCase().includes(searchTerm)) ||
      (comp.manufacturer && comp.manufacturer.toLowerCase().includes(searchTerm)) ||
      (comp.description && comp.description.toLowerCase().includes(searchTerm))
    );
  }

  // Вспомогательный метод для добавления тестовых данных
  addTestCategories() {
    const testCategories = [
      { name: 'Пассивные компоненты', parentId: null, type: 'Категория' },
      { name: 'Активные компоненты', parentId: null, type: 'Категория' },
      { name: 'Резисторы', parentId: 1, type: 'Резистор' },
      { name: 'Конденсаторы', parentId: 1, type: 'Конденсатор' },
      { name: 'Транзисторы', parentId: 2, type: 'Транзистор' },
      { name: 'Диоды', parentId: 2, type: 'Диод' },
      { name: 'Микросхемы', parentId: 2, type: 'Микросхема' }
    ];

    testCategories.forEach(category => {
      this.data.categories.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: category.name,
        parent_id: category.parentId,
        type: category.type,
        created_at: new Date().toISOString()
      });
    });
  }
}

module.exports = SimpleDatabase;
