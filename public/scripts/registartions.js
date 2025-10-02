const btn = document.querySelector('.sendBtn');
const inp = document.getElementsByTagName('input');
const regEmail = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/

const sendDataRegistartion = async (dataReg) => {
    try {
        const res = await fetch('/adduser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataReg)
        })
        const data = await res.json();
        alert(data.message)
        window.location.href = '/auth';

    } catch (error) {
        console.log(error)
        alert('Ошибка сервера. Попробуте отправить еще раз')
    }

}


btn.addEventListener('click', async () => {
    const dataReg = {
        name: '',
        dateBirth: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        ban: 0,
    }
    for (let el = 0; el < inp.length; el++) {
        if (inp[el].type == "text" && inp[el].value == '') {
            alert('Введите имя');
            return;
        } else if (inp[el].type == "text") {
            dataReg.name = inp[el].value;
        }
        if (inp[el].type == "date" && inp[el].value == '') {
            alert('Введите дату');
            return;
        } else if (inp[el].type == "date") {
            dataReg.dateBirth = inp[el].value;
        }
        if (inp[el].type == "password" && inp[el].value.length < 8) {
            alert('Пароль минимум 8 символов');
            return;
        } else if (inp[el].type == "password") {
            dataReg.password = inp[el].value;
        }
        if (inp[el].type == "email" && !regEmail.test(inp[el].value)) {
            alert('Не валидный email');
            return;
        } else if (inp[el].type == "email") {
            dataReg.email = inp[el].value;
        }
    }

    await sendDataRegistartion(dataReg)

})

