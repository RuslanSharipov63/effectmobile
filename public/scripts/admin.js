/* функция работы с каждым пользователем */
const modal = document.querySelector('.modal');
const btnDanger = document.querySelector('.btn-danger')
const btnPrimary = document.querySelector('.btn-primary')
const tbody = document.querySelector('.tb');
/* функция разбанивания и забанивания */

const setBan = async (id, action) => {
    try {
        const response = await fetch(`/bunuser/${id}/${action}`);
        const data = await response.json();
        if (data.success) {
            tbody.innerHTML = ''
            modal.style.display = 'none'
            await getAllUsers();
        }
    } catch (error) {
        console.log(error)
        return { message: 'ошибка сервера' }
    }
}
/* ------------------------------------ */

btnDanger.addEventListener('click', async () => {
    const id = modal.dataset.id
    await setBan(id, 1)
})

btnPrimary.addEventListener('click', async () => {
    const id = modal.dataset.id
    await await setBan(id, 0)
})
const getuser = (el) => {
    modal.style.display = "block"
    modal.dataset.id = el.id
    if (el.ban == 1) {
        btnDanger.disabled = true
        btnPrimary.disabled = false
    } else {
        btnPrimary.disabled = true
        btnDanger.disabled = false
    }
}

/* ---------------------------------- */

const getAllUsers = async () => {
    try {
        const response = await fetch('/users');
        const data = await response.json();

        let count = 0;
        data.map((el) => {
            let tr = document.createElement('tr');
            tr.addEventListener('click', () => {
                getuser(el);
            })
            let td2 = document.createElement('td');
            td2.innerText = ++count;
            tr.appendChild(td2)
            for (const item in el) {
                let td = document.createElement('td');
                if (item != 'id') {
                    td.innerText = el[item];
                    tr.appendChild(td)
                }
                if (item == 'ban') {
                    if (el[item] == 1) {
                        td.innerText = 'да';
                    } else {
                        td.innerText = 'нет';
                    }
                    tr.appendChild(td)
                }

            }
            tbody.appendChild(tr)
        })

        return;
    } catch (error) {
        console.log(error)
        alert('ошибка загрузки данных')
    }
}

getAllUsers();

const btnClose = document.querySelector('.btn-close');
btnClose.addEventListener('click', () => {
    modal.style.display = "none"
})

