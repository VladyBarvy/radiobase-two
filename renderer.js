let currentCategoryId = null;
let currentComponentId = null;
let componentTypes = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    try {
        // Загружаем типы компонентов
        componentTypes = await window.electronAPI.getComponentTypes();
        populateComponentTypes();
        
        // Загружаем и отображаем категории
        await loadCategories();
        
        // Заполняем выпадающие списки
        await populateCategoryDropdowns();
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        alert('Ошибка загрузки данных: ' + error.message);
    }
}

function setupEventListeners() {
    // Кнопки категорий
    document.getElementById('addCategoryBtn').addEventListener('click', showAddCategoryModal);
    document.getElementById('cancelCategoryBtn').addEventListener('click', hideAddCategoryModal);
    document.getElementById('categoryForm').addEventListener('submit', handleAddCategory);
    
    // Кнопки компонентов
    document.getElementById('addComponentBtn').addEventListener('click', showAddComponentForm);
    document.getElementById('saveComponentBtn').addEventListener('click', saveComponent);
    document.getElementById('deleteComponentBtn').addEventListener('click', deleteComponent);
    document.getElementById('closeDetailBtn').addEventListener('click', showComponentList);
    
    // Поиск
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Изменение типа компонента
    document.getElementById('componentType').addEventListener('change', updateParametersForm);
}

async function loadCategories() {
    try {
        const categories = await window.electronAPI.getCategories();
        renderCategoryTree(categories);
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
    }
}

function renderCategoryTree(categories) {
    const treeContainer = document.getElementById('categoryTree');
    treeContainer.innerHTML = '';
    
    const rootCategories = categories.filter(cat => cat.parent_id === null);
    
    rootCategories.forEach(category => {
        const categoryElement = createCategoryElement(category, categories);
        treeContainer.appendChild(categoryElement);
    });
}

function createCategoryElement(category, allCategories, level = 0) {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.style.paddingLeft = `${level * 20 + 10}px`;
    div.dataset.id = category.id;
    
    const children = allCategories.filter(cat => cat.parent_id === category.id);
    
    div.innerHTML = `
        <span>${category.name} (${category.type})</span>
        <div class="actions">
            <button onclick="event.stopPropagation(); deleteCategory(${category.id})">×</button>
        </div>
    `;
    
    div.addEventListener('click', () => selectCategory(category.id));
    
    if (children.length > 0) {
        children.forEach(child => {
            const childElement = createCategoryElement(child, allCategories, level + 1);
            div.appendChild(childElement);
        });
    }
    
    return div;
}













// async function selectCategory(categoryId) {
//     currentCategoryId = categoryId;
    
//     // Обновляем выделение в дереве
//     document.querySelectorAll('.category-item').forEach(item => {
//         item.classList.remove('selected');
//     });
//     document.querySelector(`.category-item[data-id="${categoryId}"]`).classList.add('selected');
    
//     // Загружаем компоненты категории
//     await loadComponents(categoryId);
//     showComponentList();
// }

// renderer.js - функция selectCategory
async function selectCategory(categoryId) {
  currentCategoryId = categoryId;
  
  // Обновляем выделение в дереве
  document.querySelectorAll('.category-item').forEach(item => {
    item.classList.remove('selected');
  });
  const categoryElement = document.querySelector(`.category-item[data-id="${categoryId}"]`);
  if (categoryElement) {
    categoryElement.classList.add('selected');
  }
  
  // Загружаем компоненты категории
  await loadComponents(categoryId);
  showComponentList();
}









// async function loadComponents(categoryId) {
//     try {
//         const components = await window.electronAPI.getComponents(categoryId);
//         renderComponents(components);
        
//         // Обновляем название категории
//         const categoryElement = document.querySelector(`.category-item[data-id="${categoryId}"]`);
//         const categoryName = categoryElement ? categoryElement.querySelector('span').textContent.split(' (')[0] : 'Неизвестно';
//         document.getElementById('currentCategoryName').textContent = `Компоненты: ${categoryName}`;
        
//     } catch (error) {
//         console.error('Ошибка загрузки компонентов:', error);
//     }
// }


// renderer.js - убедитесь, что эта функция есть
async function loadComponents(categoryId) {
  try {
    const components = await window.electronAPI.getComponents(categoryId);
    renderComponents(components);
    
    // Обновляем название категории
    const categoryElement = document.querySelector(`.category-item[data-id="${categoryId}"]`);
    const categoryName = categoryElement ? categoryElement.querySelector('span').textContent.split(' (')[0] : 'Неизвестно';
    document.getElementById('currentCategoryName').textContent = `Компоненты: ${categoryName}`;
    
  } catch (error) {
    console.error('Ошибка загрузки компонентов:', error);
  }
}










// function renderComponents(components) {
//     const container = document.getElementById('componentsContainer');
//     container.innerHTML = '';
    
//     if (components.length === 0) {
//         container.innerHTML = '<p>Нет компонентов в этой категории</p>';
//         return;
//     }
    
//     components.forEach(component => {
//         const card = document.createElement('div');
//         card.className = 'component-card';
//         card.innerHTML = `
//             <h4>${component.name}</h4>
//             <p><strong>Производитель:</strong> ${component.manufacturer || 'Не указан'}</p>
//             <p><strong>Партномер:</strong> ${component.part_number || 'Не указан'}</p>
//             <p><strong>Количество:</strong> ${component.stock_quantity}</p>
//         `;
//         card.addEventListener('click', () => showComponentDetail(component.id));
//         container.appendChild(card);
//     });
// }



// renderer.js - функция renderComponents
function renderComponents(components) {
  const container = document.getElementById('componentsContainer');
  container.innerHTML = '';
  
  if (components.length === 0) {
    container.innerHTML = '<p class="no-components">Нет компонентов в этой категории</p>';
    return;
  }
  
  components.forEach(component => {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.innerHTML = `
      <h4>${component.name}</h4>
      <p><strong>Производитель:</strong> ${component.manufacturer || 'Не указан'}</p>
      <p><strong>Партномер:</strong> ${component.part_number || 'Не указан'}</p>
      <p><strong>Количество:</strong> ${component.stock_quantity}</p>
      <p><strong>Категория:</strong> ${component.category_name || 'Неизвестно'}</p>
    `;
    card.addEventListener('click', () => showComponentDetail(component.id));
    container.appendChild(card);
  });
}













function showComponentList() {
    document.getElementById('componentList').style.display = 'block';
    document.getElementById('componentDetail').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'none';
    currentComponentId = null;
}

async function showComponentDetail(componentId) {
    try {
        const component = await window.electronAPI.getComponent(componentId);
        currentComponentId = componentId;
        
        // Заполняем форму данными компонента
        document.getElementById('componentId').value = component.id;
        document.getElementById('componentName').value = component.name;
        document.getElementById('componentCategory').value = component.category_id;
        document.getElementById('manufacturer').value = component.manufacturer || '';
        document.getElementById('partNumber').value = component.part_number || '';
        document.getElementById('description').value = component.description || '';
        document.getElementById('stockQuantity').value = component.stock_quantity;
        document.getElementById('datasheetUrl').value = component.datasheet_url || '';
        
        // Устанавливаем тип компонента и обновляем параметры
        const category = await getCategory(component.category_id);
        if (category) {
            document.getElementById('componentType').value = category.type;
            updateParametersForm();
            
            // Заполняем параметры
            if (component.parameters) {
                Object.entries(component.parameters).forEach(([key, value]) => {
                    const input = document.querySelector(`[name="param_${key}"]`);
                    if (input) input.value = value;
                });
            }
        }
        
        document.getElementById('componentList').style.display = 'none';
        document.getElementById('componentDetail').style.display = 'block';
        document.getElementById('welcomeScreen').style.display = 'none';
        
    } catch (error) {
        console.error('Ошибка загрузки компонента:', error);
        alert('Ошибка загрузки компонента: ' + error.message);
    }
}

function showAddComponentForm() {
    if (!currentCategoryId) {
        alert('Сначала выберите категорию');
        return;
    }
    
    // Сбрасываем форму
    document.getElementById('componentForm').reset();
    document.getElementById('componentId').value = '';
    document.getElementById('componentCategory').value = currentCategoryId;
    
    // Получаем тип категории для установки типа компонента
    const categoryElement = document.querySelector(`.category-item[data-id="${currentCategoryId}"]`);
    if (categoryElement) {
        const typeMatch = categoryElement.querySelector('span').textContent.match(/\(([^)]+)\)/);
        if (typeMatch) {
            document.getElementById('componentType').value = typeMatch[1];
            updateParametersForm();
        }
    }
    
    document.getElementById('componentList').style.display = 'none';
    document.getElementById('componentDetail').style.display = 'block';
    document.getElementById('welcomeScreen').style.display = 'none';
}




















// async function saveComponent() {
//     try {
//         const formData = new FormData(document.getElementById('componentForm'));
//         const parameters = {};
        
//         // Собираем параметры
//         const paramInputs = document.querySelectorAll('[name^="param_"]');
//         paramInputs.forEach(input => {
//             const paramName = input.name.replace('param_', '');
//             parameters[paramName] = input.value;
//         });
        
//         const component = {
//             id: formData.get('componentId') || null,
//             name: formData.get('componentName'),
//             description: formData.get('description'),
//             category_id: parseInt(formData.get('componentCategory')),
//             manufacturer: formData.get('manufacturer'),
//             part_number: formData.get('partNumber'),
//             parameters: parameters,
//             datasheet_url: formData.get('datasheetUrl'),
//             stock_quantity: parseInt(formData.get('stockQuantity')) || 0
//         };
        
//         await window.electronAPI.saveComponent(component);
        
//         // Обновляем список компонентов
//         await loadComponents(currentCategoryId);
//         showComponentList();
        
//         alert('Компонент успешно сохранен!');
        
//     } catch (error) {
//         console.error('Ошибка сохранения компонента:', error);
//         alert('Ошибка сохранения компонента: ' + error.message);
//     }
// }




// renderer.js - обновите функцию saveComponent
async function saveComponent() {
  try {
    const formData = new FormData(document.getElementById('componentForm'));
    const parameters = {};
    
    // Собираем параметры
    const paramInputs = document.querySelectorAll('[name^="param_"]');
    paramInputs.forEach(input => {
      const paramName = input.name.replace('param_', '');
      parameters[paramName] = input.value;
    });
    
    const component = {
      id: formData.get('componentId') || null,
      name: formData.get('componentName'),
      description: formData.get('description'),
      category_id: parseInt(formData.get('componentCategory')),
      manufacturer: formData.get('manufacturer'),
      part_number: formData.get('partNumber'),
      parameters: parameters,
      datasheet_url: formData.get('datasheetUrl'),
      stock_quantity: parseInt(formData.get('stockQuantity')) || 0
    };
    
    await window.electronAPI.saveComponent(component);
    
    // ОБНОВЛЯЕМ СПИСОК КОМПОНЕНТОВ ПОСЛЕ СОХРАНЕНИЯ
    if (currentCategoryId) {
      await loadComponents(currentCategoryId);
    }
    
    showComponentList();
    
    alert('Компонент успешно сохранен!');
    
  } catch (error) {
    console.error('Ошибка сохранения компонента:', error);
    alert('Ошибка сохранения компонента: ' + error.message);
  }
}













async function deleteComponent() {
    if (!currentComponentId || !confirm('Вы уверены, что хотите удалить этот компонент?')) {
        return;
    }
    
    try {
        await window.electronAPI.deleteComponent(currentComponentId);
        
        // Обновляем список компонентов
        await loadComponents(currentCategoryId);
        showComponentList();
        
        alert('Компонент успешно удален!');
        
    } catch (error) {
        console.error('Ошибка удаления компонента:', error);
        alert('Ошибка удаления компонента: ' + error.message);
    }
}

function showAddCategoryModal() {
    document.getElementById('categoryModal').style.display = 'flex';
}

function hideAddCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
    document.getElementById('categoryForm').reset();
}

async function handleAddCategory(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const parentId = formData.get('parentCategory');
        
        const category = {
            name: formData.get('categoryName'),
            parentId: parentId ? parseInt(parentId) : null,
            type: formData.get('categoryType')
        };
        
        await window.electronAPI.addCategory(category);
        
        // Обновляем дерево категорий
        await loadCategories();
        await populateCategoryDropdowns();
        
        hideAddCategoryModal();
        alert('Категория успешно добавлена!');
        
    } catch (error) {
        console.error('Ошибка добавления категории:', error);
        alert('Ошибка добавления категории: ' + error.message);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
        return;
    }
    
    try {
        await window.electronAPI.deleteCategory(categoryId);
        
        // Обновляем дерево категорий
        await loadCategories();
        await populateCategoryDropdowns();
        
        // Если удалена текущая категория, сбрасываем отображение
        if (currentCategoryId === categoryId) {
            currentCategoryId = null;
            showWelcomeScreen();
        }
        
        alert('Категория успешно удалена!');
        
    } catch (error) {
        console.error('Ошибка удаления категории:', error);
        alert('Ошибка удаления категории: ' + error.message);
    }
}

function populateComponentTypes() {
    const select = document.getElementById('categoryType');
    select.innerHTML = '<option value="">Выберите тип</option>';
    
    componentTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        select.appendChild(option);
    });
    
    // Также заполняем выпадающий список в форме компонента
    const componentTypeSelect = document.getElementById('componentType');
    componentTypeSelect.innerHTML = '<option value="">Выберите тип</option>';
    
    componentTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        componentTypeSelect.appendChild(option);
    });
}

async function populateCategoryDropdowns() {
    const categories = await window.electronAPI.getCategories();
    
    // Для модального окна категорий
    const parentSelect = document.getElementById('parentCategory');
    parentSelect.innerHTML = '<option value="">Нет (корневая категория)</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${'– '.repeat(category.level)}${category.name}`;
        parentSelect.appendChild(option);
    });
    
    // Для формы компонента
    const categorySelect = document.getElementById('componentCategory');
    categorySelect.innerHTML = '<option value="">Выберите категорию</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${'– '.repeat(category.level)}${category.name}`;
        categorySelect.appendChild(option);
    });
}

function updateParametersForm() {
    const typeSelect = document.getElementById('componentType');
    const selectedType = typeSelect.value;
    const parametersContainer = document.getElementById('parametersContainer');
    
    parametersContainer.innerHTML = '<h4>Параметры:</h4>';
    
    if (!selectedType) return;
    
    const typeSchema = componentTypes.find(t => t.name === selectedType)?.parameters_schema;
    
    if (typeSchema) {
        Object.entries(typeSchema).forEach(([paramName, paramType]) => {
            const div = document.createElement('div');
            div.className = 'parameter-input';
            
            const label = document.createElement('label');
            label.textContent = paramName.replace(/_/g, ' ') + ':';
            
            let input;
            if (paramType === 'number') {
                input = document.createElement('input');
                input.type = 'number';
                input.step = 'any';
            } else {
                input = document.createElement('input');
                input.type = 'text';
            }
            
            input.name = `param_${paramName}`;
            input.placeholder = paramName.replace(/_/g, ' ');
            
            div.appendChild(label);
            div.appendChild(input);
            parametersContainer.appendChild(div);
        });
    }
}

async function getCategory(categoryId) {
    const categories = await window.electronAPI.getCategories();
    return categories.find(cat => cat.id === categoryId);
}

function showWelcomeScreen() {
    document.getElementById('componentList').style.display = 'none';
    document.getElementById('componentDetail').style.display = 'none';
    document.getElementById('welcomeScreen').style.display = 'flex';
}

async function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        if (currentCategoryId) {
            await loadComponents(currentCategoryId);
        }
        return;
    }
    
    try {
        const results = await window.electronAPI.searchComponents(query);
        renderComponents(results);
        document.getElementById('currentCategoryName').textContent = `Результаты поиска: "${query}"`;
    } catch (error) {
        console.error('Ошибка поиска:', error);
        alert('Ошибка поиска: ' + error.message);
    }
}

// Глобальные функции для использования в HTML
window.deleteCategory = deleteCategory;
