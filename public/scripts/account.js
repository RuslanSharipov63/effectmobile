const urlPars = () => {
    const currentUrl = window.location.href
    const arrCurrentUrl = currentUrl.split("/");
    const result = arrCurrentUrl[arrCurrentUrl.length - 1]
    return result;
}

const sendDataUser = async () => {
    const card = document.querySelector('.card-body');
    card.style.display = 'none';
    const userId = urlPars();
    try {
        const response = await fetch(`/getdatauser/${userId}`)
        const data = await response.json();
        const spinner = document.querySelector('.text-primary');
        spinner.style.display = 'none';
        card.style.display = 'block';
        await viewPage(data)
        return data;
    } catch (error) {
        console.log(error)
        alert("ошибка сервера")
        return;
    }

}

sendDataUser();

const viewPage = async (data) => {
    document.querySelector('.card-title').innerText = `имя: ${data.username}`
    document.querySelector('.card-subtitle').innerText = `email: ${data.email}`
    document.querySelector('.role').innerText = `роль: ${data.role == 'user' ? "пользователь" : "администратор"}`
    document.querySelector('.status').innerText = `статус: ${data.status == 'active' ? "активный" : "не активный"}`
    document.querySelector('.ban').innerText = `ban: ${data.ban == 0 ? "нет" : "да"}`
}


const btnBan = document.querySelector('.btnBan');
btnBan.addEventListener('click', async () => {
    alert("Вы правда готовы отправить в бан?")
    const userId = urlPars();
    try {
        const response = await fetch(`/bunuser/${userId}`)
        const data = await response.json();
        alert(data.message)
        return;
    } catch (error) {
        console.log(error)
        alert('Ошибка сервера')
        return
    }

})


