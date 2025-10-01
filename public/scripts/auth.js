const authBtn = document.querySelector('.authBtn');
const inpPass = document.querySelector('.inpPass');
const inpEmail = document.querySelector('.inpEmail');


const sendAuth = async (dataAuth) => {

    try {
        const res = await fetch('/authuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataAuth)
        })
        const data = await res.json();
        alert(data.token)
        localStorage.setItem('token', data.token).
            window.location.href = '/account';
    } catch (error) {
        console.log(error)
        alert('Ошибка сервера. Попробуте отправить еще раз')
    }
}


authBtn.addEventListener('click', async () => {
    if (inpEmail == '' || inpPass.length < 8) {
        alert('Поля заполнены некорректно')
        return;
    }
    const dataAuth = {
        email: inpEmail.value,
        password: inpPass.value
    }

    await sendAuth(dataAuth)


})