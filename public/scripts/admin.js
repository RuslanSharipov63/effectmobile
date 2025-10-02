const getAllUsers = async () => {
    try {
        const response = await fetch('/users');
        const data = await response.json();
        console.log(data.results)
        return;
    } catch (error) {
        console.log(error)
        alert('ошибка загрузки данных')
    }
}

getAllUsers();