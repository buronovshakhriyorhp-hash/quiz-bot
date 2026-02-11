const questions = {
    html: [
        {
            question: "HTML qisqartmasi nimani anglatadi?",
            options: [
                "Hyper Text Makeup Language",
                "Hyper Text Markup Language",
                "Home Tool Markup Language",
                "Hyperlinks and Text Markup Language"
            ],
            correct: 1
        },
        {
            question: "Eng katta sarlavha tegini belgilang:",
            options: ["<h6>", "<head>", "<h1>", "<header>"],
            correct: 2
        },
        {
            question: "Qaysi teg qatorni tushirish (yangi qatorga o'tish) uchun ishlatiladi?",
            options: ["<br>", "<lb>", "<break>", "<newline>"],
            correct: 0
        },
        {
            question: "HTML5 da `<!DOCTYPE html>` nima uchun kerak?",
            options: [
                "Hujjat turini aniqlash uchun",
                "Sahifa sarlavhasi uchun",
                "CSS faylni ulash uchun",
                "Barcha javoblar to'g'ri"
            ],
            correct: 0
        },
        {
            question: "Qaysi teg matnni qalin (bold) qilib ko'rsatadi?",
            options: ["<i>", "<bold>", "<b>", "<list>"],
            correct: 2
        }
    ],
    css: [
        {
            question: "CSS qisqartmasi nimani anglatadi?",
            options: [
                "Creative Style Sheets",
                "Colorful Style Sheets",
                "Computer Style Sheets",
                "Cascading Style Sheets"
            ],
            correct: 3
        },
        {
            question: "HTML sahifaga CSS ulashning to'g'ri yo'li qaysi?",
            options: [
                "<style src='style.css'>",
                "<stylesheet>style.css</stylesheet>",
                "<link rel='stylesheet' href='style.css'>",
                "<css>style.css</css>"
            ],
            correct: 2
        },
        {
            question: "Qaysi xususiyat (property) matn rangini o'zgartiradi?",
            options: ["text-color", "font-color", "color", "fg-color"],
            correct: 2
        },
        {
            question: "ID selektori qanday belgilanadi?",
            options: [".", "#", "*", "@"],
            correct: 1
        },
        {
            question: "`margin: 10px 20px 5px 30px;` yozuvida chap tomon (left) margin qancha?",
            options: ["10px", "20px", "5px", "30px"],
            correct: 3 // top right bottom left
        }
    ],
    javascript: [
        {
            question: "JavaScript da o'zgaruvchi qaysi kalit so'zlar bilan e'lon qilinadi?",
            options: [
                "var, let, const",
                "int, string, float",
                "variable, constant",
                "dim, set, define"
            ],
            correct: 0
        },
        {
            question: "`console.log(typeof [])` nima chiqaradi?",
            options: ["array", "object", "list", "undefined"],
            correct: 1
        },
        {
            question: "Qaysi operator tenglikni ham qiymat, ham tur bo'yicha tekshiradi?",
            options: ["==", "=", "===", "!="],
            correct: 2
        },
        {
            question: "Funksiya qanday e'lon qilinadi?",
            options: [
                "function:myFunction()",
                "function myFunction()",
                "create myFunction()",
                "def myFunction()"
            ],
            correct: 1
        },
        {
            question: "DOM so'zining ma'nosi nima?",
            options: [
                "Document Object Model",
                "Data Object Mode",
                "Document Orientation Model",
                "Digital Ordinance Model"
            ],
            correct: 0
        },
        {
            question: "JavaScript da `NaN` nimani anglatadi?",
            options: ["Not a Number", "Null and Null", "New and New", "None a Number"],
            correct: 0
        },
        {
            question: "`alert(\"Hello World\");` kodi nima qiladi?",
            options: [
                "Konsolga yozadi",
                "Ogohlantirish oynasini chiqaradi",
                "Sahifaga yozadi",
                "Hec nima qilmaydi"
            ],
            correct: 1
        },
        {
            question: "Qaysi metod massiv oxiriga element qo'shadi?",
            options: ["pop()", "shift()", "push()", "unshift()"],
            correct: 2
        },
        {
            question: "`let i = 0; while (i < 3) { alert(i); i++; }` necha marta ogohlantirish oynasini chiqaradi?",
            options: ["0", "2", "3", "4"],
            correct: 2
        },
        {
            question: "JavaScript qaysi HTML tegining ichiga yoziladi?",
            options: ["<javascript>", "<js>", "<script>", "<scripting>"],
            correct: 2
        }
    ]
};

module.exports = questions;
