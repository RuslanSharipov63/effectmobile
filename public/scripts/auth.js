const authBtn = document.querySelector(".authBtn");
const inpPass = document.querySelector(".inpPass");
const inpEmail = document.querySelector(".inpEmail");

const sendAuth = async (dataAuth) => {
  try {
    const res = await fetch("/authuser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataAuth),
    });
    const data = await res.json();
    alert(data.message);
    if (data.role == "user") {
      window.location.href = `/account/${data.id}`;
    } else if (data.role == "admin") {
      window.location.href = `/admin/${data.id}`;
    }
  } catch (error) {
    console.log(error);
    alert("Ошибка сервера. Попробуте отправить еще раз");
  }
};

authBtn.addEventListener("click", async () => {
  if (inpEmail == "" || inpPass.length < 8) {
    alert("Поля заполнены некорректно");
    return;
  }
  const dataAuth = {
    email: inpEmail.value,
    password: inpPass.value,
  };

  await sendAuth(dataAuth);
});
