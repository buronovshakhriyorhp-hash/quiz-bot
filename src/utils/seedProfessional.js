
const sequelize = require('../database/db');
const Question = require('../models/Question');

const content = {
    html: [
        {
            section: 'Basics', q: [
                { t: 'HTML qisqartmasi nima?', o: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks Text Mark Language'], c: 0 },
                { t: '!DOCTYPE html nima uchun kerak?', o: ['Brauzerga HTML5 ekanligini bildirish uchun', 'Sahifani bezash uchun', 'Serverga ulanish uchun'], c: 0 },
                { t: '<head> tegining vazifasi nima?', o: ['Meta-ma\'lumotlarni saqlash', 'Sahifa ko\'rinishini chiqarish', 'Rasmlarni joylash'], c: 0 },
                { t: 'Eng katta sarlavha qaysi?', o: ['h1', 'h6', 'head'], c: 0 },
                { t: 'Qator tashlash tegi qaysi?', o: ['br', 'lb', 'break'], c: 0 },
                { t: 'Havola (link) yaratish uchun qaysi teg ishlatiladi?', o: ['a', 'link', 'href'], c: 0 },
                { t: 'Rasm qo\'yish uchun qaysi atribut majburiy?', o: ['src', 'href', 'link'], c: 0 },
                { t: 'Tartibli ro\'yxat qaysi teg bilan ochiladi?', o: ['ol', 'ul', 'list'], c: 0 },
                { t: 'Tartibsiz ro\'yxat qaysi teg bilan ochiladi?', o: ['ul', 'ol', 'dl'], c: 0 },
                { t: 'HTML izoh (comment) qanday yoziladi?', o: ['<!-- izoh -->', '// izoh', '/* izoh */'], c: 0 }
            ]
        },
        {
            section: 'Semantic HTML', q: [
                { t: 'Semantik teg nima?', o: ['Ma\'noga ega bo\'lgan teg (<header>)', 'Dizayn tegi', 'Eski teg'], c: 0 },
                { t: 'Saytning eng pastki qismi?', o: ['footer', 'bottom', 'section'], c: 0 },
                { t: 'Mustaqil maqola uchun?', o: ['article', 'section', 'div'], c: 0 },
                { t: 'Asosiy navigatsiya?', o: ['nav', 'menu', 'ul'], c: 0 },
                { t: 'Yon panel (sidebar)?', o: ['aside', 'sidebar', 'div'], c: 0 },
                { t: '<main> tegi necha marta ishlatilishi mumkin?', o: ['1 marta', 'Cheksiz', '2 marta'], c: 0 },
                { t: 'Rasm va ta\'rifi uchun?', o: ['figure va figcaption', 'img va p', 'div va span'], c: 0 },
                { t: '<section> nima uchun?', o: ['Mavzuga oid bo\'limlarni ajratish', 'Matn yozish', 'Rasm'], c: 0 },
                { t: '<mark> tegi?', o: ['Belgilangan (highlighted) matn', 'Qalin matn', 'O\'chirilgan matn'], c: 0 },
                { t: '<time> tegi?', o: ['Vaqt va sana uchun', 'Soat chiqarish', 'Vaqtni to\'xtatish'], c: 0 }
            ]
        },
        {
            section: 'Forms', q: [
                { t: 'Forma ma\'lumotlarini jo\'natish atributi?', o: ['action', 'src', 'href'], c: 0 },
                { t: 'Inputda yozuv chiqib turishi uchun?', o: ['placeholder', 'value', 'name'], c: 0 },
                { t: 'Parol kiritish turi?', o: ['password', 'secure', 'text'], c: 0 },
                { t: 'Faqat bitta variant tanlash?', o: ['radio', 'checkbox', 'select'], c: 0 },
                { t: 'Ko\'p qatorli matn?', o: ['textarea', 'input', 'text'], c: 0 },
                { t: 'Yuborish tugmasi?', o: ['submit', 'button', 'send'], c: 0 },
                { t: 'Majburiy input?', o: ['required', 'valid', 'mandatory'], c: 0 },
                { t: 'O\'chirilgan input?', o: ['disabled', 'readonly', 'off'], c: 0 },
                { t: 'Raqam kiritish?', o: ['number', 'digit', 'int'], c: 0 },
                { t: 'Email kiritish?', o: ['email', 'text', 'mail'], c: 0 }
            ]
        },
        {
            section: 'Tables', q: [
                { t: 'Jadval yaratish tegi?', o: ['table', 'tab', 'grid'], c: 0 },
                { t: 'Jadval qatori?', o: ['tr', 'td', 'th'], c: 0 },
                { t: 'Jadval katakchasi?', o: ['td', 'tr', 'cell'], c: 0 },
                { t: 'Jadval sarlavhasi?', o: ['th', 'head', 'title'], c: 0 },
                { t: 'Ikki ustunni birlashtirish?', o: ['colspan', 'rowspan', 'merge'], c: 0 },
                { t: 'Ikki qatorni birlashtirish?', o: ['rowspan', 'colspan', 'merge'], c: 0 },
                { t: 'Jadval sarlavhasi tegi?', o: ['caption', 'title', 'head'], c: 0 },
                { t: 'Jadval tanasi?', o: ['tbody', 'body', 'main'], c: 0 },
                { t: 'Jadval boshi?', o: ['thead', 'header', 'top'], c: 0 },
                { t: 'Jadval oyog\'i?', o: ['tfoot', 'footer', 'bottom'], c: 0 }
            ]
        },
        {
            section: 'Multimedia', q: [
                { t: 'Audio qo\'shish tegi?', o: ['audio', 'sound', 'music'], c: 0 },
                { t: 'Video qo\'shish tegi?', o: ['video', 'movie', 'film'], c: 0 },
                { t: 'Videoni avtomatik o\'ynash?', o: ['autoplay', 'play', 'start'], c: 0 },
                { t: 'Videoni boshqaruv tugmalari?', o: ['controls', 'buttons', 'menu'], c: 0 },
                { t: 'Video takrorlanishi?', o: ['loop', 'repeat', 'again'], c: 0 },
                { t: 'Video ovozsiz bo\'lishi?', o: ['muted', 'silent', 'quiet'], c: 0 },
                { t: 'YouTube video qo\'shish tegi?', o: ['iframe', 'video', 'embed'], c: 0 },
                { t: 'Rasm xaritasi tegi?', o: ['map', 'area', 'img'], c: 0 },
                { t: 'SVG nima?', o: ['Scalable Vector Graphics', 'Simple Vector Check', 'Standard Video Game'], c: 0 },
                { t: 'Canvas nima?', o: ['Grafika chizish maydoni', 'Rasm', 'Video'], c: 0 }
            ]
        },
        {
            section: 'Meta Tags', q: [
                { t: 'Meta teglar qayerda joylashadi?', o: ['head ichida', 'body ichida', 'footer ichida'], c: 0 },
                { t: 'Belgilar kodirovkasini o\'rnatish?', o: ['charset="UTF-8"', 'code="UTF-8"', 'lang="UTF-8"'], c: 0 },
                { t: 'Sahifa ta\'rifi?', o: ['name="description"', 'name="info"', 'name="about"'], c: 0 },
                { t: 'Sahifa kalit so\'zlari?', o: ['name="keywords"', 'name="tags"', 'name="keys"'], c: 0 },
                { t: 'Mobil moslashuvchanlik uchun?', o: ['name="viewport"', 'name="mobile"', 'name="responsive"'], c: 0 },
                { t: 'Avtor ismi?', o: ['name="author"', 'name="creator"', 'name="writer"'], c: 0 },
                { t: 'Sahifa yangilanishi (refresh)?', o: ['http-equiv="refresh"', 'meta="reload"', 'refresh="5"'], c: 0 },
                { t: 'Qidiruv tizimlari robotlari uchun?', o: ['name="robots"', 'name="bot"', 'name="crawl"'], c: 0 },
                { t: 'Favicon ulash?', o: ['rel="icon"', 'rel="logo"', 'rel="img"'], c: 0 },
                { t: 'Open Graph (Facebook) teglari?', o: ['og:', 'fb:', 'social:'], c: 0 }
            ]
        },
        {
            section: 'Accessibility', q: [
                { t: 'Rasmlar uchun muqobil matn?', o: ['alt', 'title', 'desc'], c: 0 },
                { t: 'ARIA qisqartmasi?', o: ['Accessible Rich Internet Applications', 'All Rich Internet Apps', 'Auto Rich Info Access'], c: 0 },
                { t: 'Screen reader nima?', o: ['Ekrandagi matnni o\'qib beruvchi dastur', 'Ekranni yozib oluvchi', 'Ekranni tozalovchi'], c: 0 },
                { t: 'Tugma vazifasini bildiruvchi atribut?', o: ['role="button"', 'type="btn"', 'class="button"'], c: 0 },
                { t: 'Input va Label bog\'lash?', o: ['for va id', 'name va id', 'class va id'], c: 0 },
                { t: 'Klaviatura bilan navigatsiya?', o: ['tabindex', 'keyindex', 'navindex'], c: 0 },
                { t: 'Yashirin matn (screen reader uchun)?', o: ['aria-label', 'hidden-text', 'alt-text'], c: 0 },
                { t: 'Tilni belgilash?', o: ['lang="uz"', 'language="uz"', 'locale="uz"'], c: 0 },
                { t: 'Sarlavhalar ketma-ketligi nega muhim?', o: ['Navigatsiya va tushunish osonligi uchun', 'Dizayn uchun', 'Muhim emas'], c: 0 },
                { t: 'Video subtitrlari uchun teg?', o: ['track', 'subtitle', 'caption'], c: 0 }
            ]
        },
        {
            section: 'Global Attributes', q: [
                { t: 'Barcha elementlarda ishlaydigan ID atributi?', o: ['id', 'uuid', 'uid'], c: 0 },
                { t: 'Elementga klass berish?', o: ['class', 'style', 'type'], c: 0 },
                { t: 'Element ichidagi matnni tahrirlash imkoni?', o: ['contenteditable', 'editable', 'textedit'], c: 0 },
                { t: 'Elementni yashirish?', o: ['hidden', 'hide', 'invisible'], c: 0 },
                { t: 'Qo\'shimcha ma\'lumot ko\'rsatish (tooltip)?', o: ['title', 'info', 'tooltip'], c: 0 },
                { t: 'Tab tugmasi orqali yurish tartibi?', o: ['tabindex', 'order', 'sequence'], c: 0 },
                { t: 'Drag and Drop funksiyasi?', o: ['draggable', 'drag', 'drop'], c: 0 },
                { t: 'Element yo\'nalishi (LTR/RTL)?', o: ['dir', 'direction', 'align'], c: 0 },
                { t: 'Maxsus ma\'lumot saqlash (data-*)?', o: ['data-name', 'info-name', 'meta-name'], c: 0 },
                { t: 'Imloni tekshirish?', o: ['spellcheck', 'grammar', 'check'], c: 0 }
            ]
        }
    ],
    css: [
        {
            section: 'Basics', q: [
                { t: 'CSS nimani anglatadi?', o: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets'], c: 0 },
                { t: 'HTML ga CSS ulashning eng yaxshi yo\'li?', o: ['External', 'Internal', 'Inline'], c: 0 },
                { t: 'ID selektori?', o: ['#', '.', '*'], c: 0 },
                { t: 'Class selektori?', o: ['.', '#', '&'], c: 0 },
                { t: 'Hamma elementni tanlash?', o: ['*', 'all', 'body'], c: 0 },
                { t: 'Orqa fon rangi?', o: ['background-color', 'color', 'bgcolor'], c: 0 },
                { t: 'Matn rangi?', o: ['color', 'font-color', 'text-color'], c: 0 },
                { t: 'Matn o\'lchami?', o: ['font-size', 'text-size', 'size'], c: 0 },
                { t: 'CSS izoh?', o: ['/* izoh */', '// izoh', '<!-- izoh -->'], c: 0 },
                { t: 'Eng kuchli selektor?', o: ['ID', 'Class', 'Tag'], c: 0 }
            ]
        },
        {
            section: 'Box Model', q: [
                { t: 'Box Model tarkibi?', o: ['Margin, Border, Padding, Content', 'Header, Footer', 'Color, Bg'], c: 0 },
                { t: 'Ichki bo\'shliq?', o: ['padding', 'margin', 'border'], c: 0 },
                { t: 'Tashqi bo\'shliq?', o: ['margin', 'padding', 'spacing'], c: 0 },
                { t: 'Chegara chizig\'i?', o: ['border', 'outline', 'line'], c: 0 },
                { t: 'box-sizing: border-box?', o: ['Padding va Border o\'lchamga kiradi', 'Faqat content', 'Yashirish'], c: 0 },
                { t: 'Umumi kenglik (content-box)?', o: ['width + padding + border', 'width + height', 'width'], c: 0 },
                { t: 'Margin collapse?', o: ['Marginlar birlashishi', 'Margin yo\'qolishi', 'Margin ko\'payishi'], c: 0 },
                { t: 'Manfiy margin?', o: ['Elementni tortadi', 'Xatolik', 'Yo\'q narsa'], c: 0 },
                { t: 'Outline vs Border?', o: ['Outline joy egallamaydi', 'Rangli', 'Qalin'], c: 0 },
                { t: 'Markazlash (gorizontal)?', o: ['margin: 0 auto', 'center', 'align: center'], c: 0 }
            ]
        },
        {
            section: 'Flexbox', q: [
                { t: 'Flexbox yoqish?', o: ['display: flex', 'display: block', 'position: flex'], c: 0 },
                { t: 'Asosiy o\'q yo\'nalishi?', o: ['flex-direction', 'flex-wrap', 'justify'], c: 0 },
                { t: 'Asosiy o\'q bo\'yicha tekislash?', o: ['justify-content', 'align-items', 'align-content'], c: 0 },
                { t: 'Ko\'ndalang o\'q bo\'yicha tekislash?', o: ['align-items', 'justify-content', 'text-align'], c: 0 },
                { t: 'Yangi qatorga o\'tish?', o: ['flex-wrap: wrap', 'flex-flow: column', 'overflow: hidden'], c: 0 },
                { t: 'space-between?', o: ['Chetlarga taqalib, o\'rtada joy', 'O\'rtaga yig\'ish', 'Bo\'sh joy yo\'q'], c: 0 },
                { t: 'flex-grow: 1?', o: ['Element bo\'sh joyni oladi', 'Kichrayadi', 'O\'zgarmaydi'], c: 0 },
                { t: 'flex-basis?', o: ['Boshlang\'ich o\'lcham', 'Minimal o\'lcham', 'Rang'], c: 0 },
                { t: 'Bitta elementni tekislash?', o: ['align-self', 'align-items', 'justify-self'], c: 0 },
                { t: 'Elementlar orasidagi masofa?', o: ['gap', 'margin', 'padding'], c: 0 }
            ]
        },
        {
            section: 'Grid', q: [
                { t: 'Grid yoqish?', o: ['display: grid', 'display: flex', 'display: box'], c: 0 },
                { t: 'Ustunlar hosil qilish?', o: ['grid-template-columns', 'grid-columns', 'columns'], c: 0 },
                { t: 'Qatorlar hosil qilish?', o: ['grid-template-rows', 'grid-rows', 'rows'], c: 0 },
                { t: '1fr nimani anglatadi?', o: ['Bo\'sh joyning 1 qismi (fraction)', '1 frame', '1 font-size'], c: 0 },
                { t: 'Gridlar orasidagi masofa?', o: ['gap', 'grid-gap', 'margin'], c: 0 },
                { t: 'Element qayerdan boshlanishi?', o: ['grid-column-start', 'grid-start', 'column-start'], c: 0 },
                { t: 'Element qayerda tugashi?', o: ['grid-column-end', 'grid-end', 'column-end'], c: 0 },
                { t: 'Qisqa yozuv (area)?', o: ['grid-area', 'grid-template', 'grid-region'], c: 0 },
                { t: 'Grid vs Flexbox?', o: ['Grid 2D, Flexbox 1D', 'Bir xil', 'Grid eski'], c: 0 },
                { t: 'Avtomatik takrorlash?', o: ['repeat()', 'loop()', 'auto()'], c: 0 }
            ]
        },
        {
            section: 'Typography', q: [
                { t: 'Shrift turi?', o: ['font-family', 'font-type', 'font-name'], c: 0 },
                { t: 'Shrift qalinligi?', o: ['font-weight', 'font-bold', 'text-weight'], c: 0 },
                { t: 'Shrift stili (qiyshiq)?', o: ['font-style: italic', 'font-type: italic', 'text-style: italic'], c: 0 },
                { t: 'Matn tagiga chizish?', o: ['text-decoration: underline', 'text-style: underline', 'font-decoration'], c: 0 },
                { t: 'Harflar orasi?', o: ['letter-spacing', 'word-spacing', 'text-spacing'], c: 0 },
                { t: 'So\'zlar orasi?', o: ['word-spacing', 'letter-spacing', 'text-gap'], c: 0 },
                { t: 'Qator balandligi?', o: ['line-height', 'text-height', 'font-height'], c: 0 },
                { t: 'Matn soya (shadow)?', o: ['text-shadow', 'font-shadow', 'shadow'], c: 0 },
                { t: 'Katta harflar?', o: ['text-transform: uppercase', 'font-case: upper', 'text-style: upper'], c: 0 },
                { t: 'Matnni tekislash?', o: ['text-align', 'align', 'font-align'], c: 0 }
            ]
        },
        {
            section: 'Colors & Backgrounds', q: [
                { t: 'RGB nima?', o: ['Red Green Blue', 'Red Grey Black', 'Real Green Blue'], c: 0 },
                { t: 'RGBA dagi A nima?', o: ['Alpha (shaffoflik)', 'Aqua', 'All'], c: 0 },
                { t: 'HEX kod qanday boshlanadi?', o: ['#', '.', '0x'], c: 0 },
                { t: 'Orqa fon rasmi?', o: ['background-image', 'background-img', 'image'], c: 0 },
                { t: 'Rasm takrorlanmasligi?', o: ['background-repeat: no-repeat', 'repeat: none', 'no-loop'], c: 0 },
                { t: 'Rasm o\'lchami?', o: ['background-size', 'image-size', 'size'], c: 0 },
                { t: 'Rasm joylashuvi?', o: ['background-position', 'image-place', 'pos'], c: 0 },
                { t: 'Gradient hosil qilish?', o: ['linear-gradient', 'color-gradient', 'mix'], c: 0 },
                { t: '0 to\'liq shaffofmi yoki ko\'rinadiganmi (opacity)?', o: ['To\'liq shaffof (ko\'rinmaydi)', 'Ko\'rinadi', 'Yarim'], c: 0 },
                { t: 'HSL nima?', o: ['Hue Saturation Lightness', 'High Standard Light', 'HTML Style List'], c: 0 }
            ]
        },
        {
            section: 'Positioning', q: [
                { t: 'Default position qiymati?', o: ['static', 'relative', 'absolute'], c: 0 },
                { t: 'O\'z joyiga nisbatan siljish?', o: ['relative', 'absolute', 'fixed'], c: 0 },
                { t: 'Ota elementga nisbatan siljish?', o: ['absolute', 'relative', 'static'], c: 0 },
                { t: 'Ekran bo\'yicha qotib turish?', o: ['fixed', 'sticky', 'static'], c: 0 },
                { t: 'Scroll paytida yopishib qolish?', o: ['sticky', 'fixed', 'absolute'], c: 0 },
                { t: 'Qatlamlar ketma-ketligi (ustma-ust)?', o: ['z-index', 'layer', 'index'], c: 0 },
                { t: 'Elementni yashirish lekin joy saqlash?', o: ['visibility: hidden', 'display: none', 'opacity: 0'], c: 0 },
                { t: 'Elementni yashirish va joyni yo\'qotish?', o: ['display: none', 'visibility: hidden', 'opacity: 0'], c: 0 },
                { t: 'Elementni suzdirish (eski)?', o: ['float', 'swim', 'move'], c: 0 },
                { t: 'Float ta\'sirini tozalash?', o: ['clear', 'clean', 'float: none'], c: 0 }
            ]
        }
    ],
    javascript: [
        {
            section: 'Basics I', q: [
                { t: 'JavaScriptda o\'zgaruvchilarni e\'lon qilish uchun qaysi kalit so\'zlar ishlatiladi?', o: ['var, let, const', 'int, str', 'dim'], c: 0 },
                { t: 'JavaScriptda o\'zgarmas (qiymati o\'zgarmaydigan) o\'zgaruvchi qanday e\'lon qilinadi?', o: ['const', 'let', 'var'], c: 0 },
                { t: 'JavaScript dasturlash tili nechanchi yilda yaratilgan?', o: ['1995', '2000', '1990'], c: 0 },
                { t: 'JavaScript va Java dasturlash tillari bir xilmi?', o: ['Yo\'q', 'Ha', 'O\'xshash'], c: 0 },
                { t: 'JavaScriptda nechta Primitive (oddiy) ma\'lumot turi mavjud?', o: ['7', '5', '3'], c: 0 },
                { t: 'Bir qatorli izoh (comment) qaysi belgi bilan yoziladi?', o: ['// comment', '/* comment */', '# comment'], c: 0 },
                { t: 'Ko\'p qatorli izoh (comment) qanday yoziladi?', o: ['/* comment */', '// comment', '<!-- comment -->'], c: 0 },
                { t: 'JavaScriptda String (matn) qanday qo\'shtirnoqlar ichida yozilishi mumkin?', o: ['Single (\') va Double (")', 'Faqat Single', 'Faqat Double'], c: 0 },
                { t: 'Ma\'lumotni brauzer konsoliga chiqarish uchun qaysi buyruq ishlatiladi?', o: ['console.log()', 'print()', 'echo()'], c: 0 },
                { t: 'alert() funksiyasi qanday vazifani bajaradi?', o: ['Xabar oynasini chiqaradi', 'Konsolga yozadi', 'Sahifani yopadi'], c: 0 }
            ]
        },
        {
            section: 'Basics II', q: [
                { t: 'Math.PI ning qiymati taxminan nechiga teng?', o: ['3.1415...', '3.14', '3.00'], c: 0 },
                { t: '0 va 1 oralig\'idagi tasodifiy sonni olish uchun qaysi metod ishlatiladi?', o: ['Math.random()', 'Math.rnd()', 'random()'], c: 0 },
                { t: 'Sonni eng yaqin butun songa yaxlitlash uchun qaysi metod ishlatiladi?', o: ['Math.round()', 'Math.ceil()', 'Math.int()'], c: 0 },
                { t: 'String (matn) uzunligini aniqlash uchun qaysi xossa (property) ishlatiladi?', o: ['.length', '.size', '.count'], c: 0 },
                { t: 'Matnni to\'liq katta harflarga o\'tkazish metodi qaysi?', o: ['.toUpperCase()', '.toUpper()', '.upper()'], c: 0 },
                { t: 'Matnni to\'liq kichik harflarga o\'tkazish metodi qaysi?', o: ['.toLowerCase()', '.toLower()', '.lower()'], c: 0 },
                { t: 'Matndan bir qismini qirqib olish uchun qaysi metod ishlatiladi?', o: ['.slice()', '.cut()', '.clip()'], c: 0 },
                { t: 'JavaScriptda shart operatori qanday yoziladi?', o: ['if...else', 'check...do', 'when...then'], c: 0 },
                { t: 'Ternary (uchlik) operatorining to\'g\'ri sintaksisini ko\'rsating:', o: ['condition ? true : false', 'if ? true : false', 'condition : true ? false'], c: 0 },
                { t: 'switch...case operatori qanday vazifani bajaradi?', o: ['Ko\'p shartli tekshiruv', 'Sikl', 'Funksiya'], c: 0 }
            ]
        },
        {
            section: 'Basics III', q: [
                { t: 'Ma\'lum bir kodni qayta-qayta bajarish uchun nima ishlatiladi?', o: ['for', 'repeat', 'loop'], c: 0 },
                { t: 'while sikli qanday ishlaydi?', o: ['Shart bajarilguncha ishlaydi', 'Bir marta ishlaydi', 'Ishlamaydi'], c: 0 },
                { t: 'do...while siklining while dan asosiy farqi nimada?', o: ['Kamida bir marta ishlaydi', 'Farqi yo\'q', 'Sekinroq'], c: 0 },
                { t: 'break operatori sikl ichida nima vazifani bajaradi?', o: ['Siklni to\'xtatadi', 'Siklni o\'tkazib yuboradi', 'Xato beradi'], c: 0 },
                { t: 'continue operatori sikl ichida nima vazifani bajaradi?', o: ['Joriy iteratsiyani o\'tkazib yuboradi', 'Siklni to\'xtatadi', 'Chiqib ketadi'], c: 0 },
                { t: 'Type Coercion (turlarni majburiy o\'zgartirish) nima?', o: ['Avtomatik tur o\'zgarishi', 'Xatolik', 'O\'zgarmaydi'], c: 0 },
                { t: 'typeof NaN (Not a Number) nima qaytaradi?', o: ['number', 'NaN', 'undefined'], c: 0 },
                { t: 'Qiymatning son emasligini tekshirish uchun qaysi funksiya ishlatiladi?', o: ['isNaN()', 'isNumber()', 'checkNaN()'], c: 0 },
                { t: 'Matn (String) ko\'rinishidagi sonni butun songa o\'tkazish uchun nima ishlatiladi?', o: ['parseInt()', 'toInt()', 'number()'], c: 0 },
                { t: 'JavaScriptda Infinity qiymati nimani anglatadi?', o: ['Cheksizlik', 'Katta son', 'Xato'], c: 0 }
            ]
        },
        {
            section: 'Functions', q: [
                { t: 'Funksiya e\'lon qilish?', o: ['function', 'def', 'func'], c: 0 },
                { t: 'Arrow function?', o: ['=>', '->', '<-'], c: 0 },
                { t: 'IIFE?', o: ['Darhol ishga tushuvchi funksiya', 'Kechikuvchi', 'Xato'], c: 0 },
                { t: 'Callback?', o: ['Funksiyaga berilgan funksiya', 'Qaytaruvchi', 'Oddiy'], c: 0 },
                { t: 'return?', o: ['Qiymat qaytaradi', 'To\'xtatadi', 'Chiqaradi'], c: 0 },
                { t: 'Default param?', o: ['a = 1', 'a : 1', 'a -> 1'], c: 0 },
                { t: 'arguments arrow functionda bormi?', o: ['Yo\'q', 'Ha', 'Balki'], c: 0 },
                { t: 'Higher Order Function?', o: ['Funksiya qaytaruvchi funksiya', 'Katta funksiya', 'Class'], c: 0 },
                { t: 'Recursion?', o: ['O\'zini chaqirish', 'Takrorlash', 'Xato'], c: 0 },
                { t: 'Pure function?', o: ['Side effectsiz', 'Toza', 'Tez'], c: 0 }
            ]
        },
        {
            section: 'Array Methods', q: [
                { t: 'Oxiriga qo\'shish?', o: ['push', 'pop', 'add'], c: 0 },
                { t: 'Oxiridan olish?', o: ['pop', 'push', 'del'], c: 0 },
                { t: 'Boshiga qo\'shish?', o: ['unshift', 'shift', 'insert'], c: 0 },
                { t: 'map()?', o: ['O\'zgartirib yangi massiv', 'Filtr', 'Yig\'indi'], c: 0 },
                { t: 'filter()?', o: ['Ajratib olish', 'O\'zgartirish', 'Qidirish'], c: 0 },
                { t: 'reduce()?', o: ['Qisqartirish (yig\'indi)', 'Ko\'paytirish', 'Bo\'lish'], c: 0 },
                { t: 'Qidirish?', o: ['find', 'search', 'get'], c: 0 },
                { t: 'Stringga aylantirish?', o: ['join', 'split', 'reverse'], c: 0 },
                { t: 'Nusxa olish?', o: ['slice', 'splice', 'cut'], c: 0 },
                { t: 'forEach() return?', o: ['undefined', 'array', 'item'], c: 0 }
            ]
        },
        {
            section: 'DOM', q: [
                { t: 'DOM?', o: ['Document Object Model', 'Data Model', 'Doc Mode'], c: 0 },
                { t: 'ID orqali olish?', o: ['getElementById', 'querySelector', 'get'], c: 0 },
                { t: 'Class orqali?', o: ['getElementsByClassName', 'getClass', 'class'], c: 0 },
                { t: 'HTML content?', o: ['innerHTML', 'text', 'html'], c: 0 },
                { t: 'Class qo\'shish?', o: ['classList.add', 'className', 'addClass'], c: 0 },
                { t: 'Yaratish?', o: ['createElement', 'new', 'create'], c: 0 },
                { t: 'Qo\'shish?', o: ['appendChild', 'add', 'append'], c: 0 },
                { t: 'O\'chirish?', o: ['remove', 'delete', 'kill'], c: 0 },
                { t: 'Hodisa?', o: ['addEventListener', 'on', 'listen'], c: 0 },
                { t: 'Input qiymati?', o: ['value', 'text', 'val'], c: 0 }
            ]
        },
        {
            section: 'Async/Await', q: [
                { t: 'Asinxron kod nima?', o: ['Kutib turmaydigan kod', 'Ketma-ket kod', 'Xato kod'], c: 0 },
                { t: 'Promise nima?', o: ['Kelajakdagi natija va\'dasi', 'Funksiya', 'Obyekt'], c: 0 },
                { t: 'async funksiya nima qaytaradi?', o: ['Promise', 'String', 'Number'], c: 0 },
                { t: 'await qayerda ishlatiladi?', o: ['async funksiya ichida', 'Hamma joyda', 'Loop ichida'], c: 0 },
                { t: 'Promise holatlari?', o: ['Pending, Fulfilled, Rejected', 'Start, End', 'On, Off'], c: 0 },
                { t: 'setTimeout nima?', o: ['Vaqt o\'tib ishga tushish', 'Interval', 'Loop'], c: 0 },
                { t: 'setInterval nima?', o: ['Takroriy ishga tushish', 'Bir marta', 'To\'xtash'], c: 0 },
                { t: 'fetch() nima qaytaradi?', o: ['Promise', 'JSON', 'String'], c: 0 },
                { t: 'JSON.parse()?', o: ['Stringni Obyektga aylantirish', 'Obyektni Stringga', 'Nusxa olish'], c: 0 },
                { t: 'JSON.stringify()?', o: ['Obyektni Stringga aylantirish', 'Stringni Obyektga', 'Parse'], c: 0 }
            ]
        },
        {
            section: 'ES6+ Features', q: [
                { t: 'Destructuring nima?', o: ['Obyekt/Massivdan qiymatni ajratib olish', 'Buzish', 'Yig\'ish'], c: 0 },
                { t: 'Spread operator?', o: ['... (yoyish)', '->', '=>'], c: 0 },
                { t: 'Rest parameter?', o: ['... (yig\'ish)', 'args', 'params'], c: 0 },
                { t: 'Template Literal?', o: ['`...` (backticks)', '\'...\'', '"..."'], c: 0 },
                { t: 'Class e\'lon qilish?', o: ['class', 'struct', 'object'], c: 0 },
                { t: 'Modul eksport qilish?', o: ['export', 'return', 'out'], c: 0 },
                { t: 'Modul import qilish?', o: ['import', 'require', 'include'], c: 0 },
                { t: 'Default parameter?', o: ['function(a=1)', 'function(a)', 'func'], c: 0 },
                { t: 'Set nima?', o: ['Takrorlanmas qiymatlar to\'plami', 'Massiv', 'Obyekt'], c: 0 },
                { t: 'Map nima?', o: ['Kalit-qiymat to\'plami', 'Massiv', 'List'], c: 0 }
            ]
        },
        {
            section: 'Objects & Prototypes', q: [
                { t: 'this kalit so\'zi?', o: ['Joriy kontekst (obyekt)', 'Funksiya', 'Global'], c: 0 },
                { t: 'Obyekt yaratish?', o: ['{}', '[]', '()'], c: 0 },
                { t: 'Kalit bormi tekshirish?', o: ['in operatori', 'exists', 'has'], c: 0 },
                { t: 'Prototype nima?', o: ['Obyektlar meros olish mexanizmi', 'Funksiya', 'Klass'], c: 0 },
                { t: 'Obyekt nusxalash (clone)?', o: ['Object.assign / Spread', 'copy', 'clone'], c: 0 },
                { t: 'Object.keys()?', o: ['Kalitlar massivi', 'Qiymatlar', 'Hammasi'], c: 0 },
                { t: 'Object.values()?', o: ['Qiymatlar massivi', 'Kalitlar', 'Xato'], c: 0 },
                { t: 'Constructor function?', o: ['new bilan chaqiriladi', 'Oddiy funksiya', 'Arrow'], c: 0 },
                { t: 'Meros olish (Class)?', o: ['extends', 'implements', 'inherits'], c: 0 },
                { t: 'super() nima?', o: ['Ota klass konstruktori', 'Katta', 'Asosiy'], c: 0 }
            ]
        },
        {
            section: 'General I', q: [
                { t: 'JavaScript tilining asoschisi (muallifi) kim?', o: ['Brendan Eich', 'James Gosling', 'Guido van Rossum'], c: 0 },
                { t: 'JavaScriptning rasmiy standarti qanday nomlanadi?', o: ['ECMAScript', 'JavaScript Standard', 'WebScript'], c: 0 },
                { t: 'JavaScriptni qo\'llab-quvvatlagan birinchi veb-brauzer qaysi?', o: ['Netscape', 'Internet Explorer', 'Chrome'], c: 0 },
                { t: 'ES6 (Modern JS) standarti qaysi yilda e\'lon qilingan?', o: ['2015', '2016', '2014'], c: 0 },
                { t: 'JavaScriptda "Strict Mode" (Qat\'iy rejim) qanday yoqiladi?', o: ['\'use strict\'', '\'strict mode\'', 'strict: true'], c: 0 },
                { t: 'Google Chrome brauzerida qaysi JavaScript dvigateli (engine) ishlatiladi?', o: ['V8', 'SpiderMonkey', 'Chakra'], c: 0 },
                { t: 'Mozilla Firefox brauzerida qaysi JavaScript dvigateli (engine) ishlatiladi?', o: ['SpiderMonkey', 'V8', 'Nitro'], c: 0 },
                { t: 'Node.js platformasi qaysi JavaScript dvigatelida ishlaydi?', o: ['V8', 'NodeEngine', 'Libuv'], c: 0 },
                { t: 'ECMAScript standartlarini ishlab chiquvchi qo\'mita nomi?', o: ['TC39', 'W3C', 'WHATWG'], c: 0 },
                { t: 'JavaScript fayllarining kengaytmasi qanday?', o: ['.js', '.java', '.script'], c: 0 }
            ]
        },
        {
            section: 'General II', q: [
                { t: 'Hoisting (ko\'tarilish) hodisasi nima?', o: ['O\'zgaruvchi va funksiya e\'lonining yuqoriga ko\'tarilishi', 'Funksiya chaqirish', 'Xatolik'], c: 0 },
                { t: 'JavaScriptda qanday Scope (qamrov) turlari mavjud?', o: ['Global, Function, Block', 'Public, Private', 'Static, Dynamic'], c: 0 },
                { t: 'Closure (yopilma) nima?', o: ['Funksiya va uning leksik muhiti', 'Yopiq funksiya', 'Klass'], c: 0 },
                { t: 'Brauzerda global "this" nimaga teng?', o: ['window', 'global', 'document'], c: 0 },
                { t: 'Strict Mode rejimida funksiya ichida "this" nimaga teng?', o: ['undefined', 'null', 'window'], c: 0 },
                { t: 'Event Loop ning asosiy vazifasi nima?', o: ['Asinxron vazifalarni boshqarish va Call Stack ga uzatish', 'Siklni aylantirish', 'DOM chizish'], c: 0 },
                { t: 'Call Stack (Chaqiruvlar steki) qanday ishlaydi?', o: ['LIFO (Last In First Out) - Oxirgi kirgan birinchi chiqadi', 'FIFO', 'Queue'], c: 0 },
                { t: 'Memory Heap xotirada nima saqlanadi?', o: ['Obyektlar va funksiyalar', 'Faqat primitivlar', 'Stack'], c: 0 },
                { t: 'Garbage Collection (Chiqindi yig\'ish) nima?', o: ['Ishlatilmayotgan xotirani avtomatik tozalash', 'Fayllarni o\'chirish', 'Cache'], c: 0 },
                { t: 'JavaScript Single Threaded (yagona oqimli) tilmi?', o: ['Ha', 'Yo\'q', 'Balki'], c: 0 }
            ]
        },
        {
            section: 'General III', q: [
                { t: 'DOM (Document Object Model) JavaScriptning bir qismimi?', o: ['Yo\'q, u Web API hisoblanadi', 'Ha, JS yadrosi', 'Balki'], c: 0 },
                { t: 'Node.js muhitida "window" obyekti mavjudmi?', o: ['Yo\'q', 'Ha', 'Bor'], c: 0 },
                { t: 'Node.js da global o\'zgaruvchilar qaysi obyektda saqlanadi?', o: ['global', 'window', 'root'], c: 0 },
                { t: '"console" obyekti qayerda mavjud?', o: ['Hammasida (Browser & Node)', 'Faqat Browser', 'Faqat Node'], c: 0 },
                { t: 'setTimeout funksiyasi JavaScript yadrosiga tegishlimi?', o: ['Yo\'q, bu Web API / Node API', 'Ha, JS yadrosi', 'Bilmayman'], c: 0 },
                { t: 'Synchronous va Asynchronous kod farqi?', o: ['Sync - bloklaydi, Async - bloklamaydi (kutmaydi)', 'Tez va sekin', 'Eski va yangi'], c: 0 },
                { t: '"Blocking code" (bloklovchi kod) nima?', o: ['Dastur ijrosini to\'xtatib turuvchi og\'ir operatsiya', 'Xato kod', 'Katta kod'], c: 0 },
                { t: 'Event Bubbling hodisasi nima?', o: ['Hodisaning ichki elementdan tashqi elementga tarqalishi', 'Pastga tushishi', 'Yo\'qolishi'], c: 0 },
                { t: 'preventDefault() metodi nima qiladi?', o: ['Hodisaning standart amalini (masalan, linkga o\'tishni) bekor qiladi', 'To\'xtatadi', 'Chiqaradi'], c: 0 },
                { t: 'stopPropagation() metodi nima qiladi?', o: ['Hodisaning boshqa elementlarga tarqalishini to\'xtatadi', 'Defaultni to\'xtatadi', 'Hech narsa'], c: 0 }
            ]
        }
    ]
};

async function seed() {
    console.log('Seeding professional content (Expanded)...');
    try {
        await sequelize.sync({ alter: true });

        // Cleanup old 'Basics' and 'General' sections to avoid duplicates
        await Question.destroy({ where: { topic: 'javascript', section: 'Basics' } });
        await Question.destroy({ where: { topic: 'javascript', section: 'General' } });
        console.log("Cleaned up old 'Basics' and 'General' sections.");

        for (const [topic, sections] of Object.entries(content)) {
            for (const sect of sections) {
                for (const q of sect.q) {
                    // Randomize options using Fisher-Yates shuffle
                    const correctOptionText = q.o[q.c];
                    let shuffledOptions = [...q.o];

                    for (let i = shuffledOptions.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
                    }

                    const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

                    const existing = await Question.findOne({ where: { questionText: q.t } });
                    if (existing) {
                        // Update existing question with shuffled options using direct update
                        await Question.update({
                            options: shuffledOptions,
                            correctOptionIndex: newCorrectIndex
                        }, {
                            where: { id: existing.id }
                        });
                        // console.log(`Updated: ${q.t.substring(0, 20)}...`);
                    } else {
                        // Create new
                        await Question.create({
                            topic: topic,
                            section: sect.section,
                            questionText: q.t,
                            options: shuffledOptions,
                            correctOptionIndex: newCorrectIndex,
                            type: 'text'
                        });
                    }
                }
                console.log(`Seeded ${topic} - ${sect.section}`);
            }
        }
        console.log('Massive Seeding complete!');
    } catch (e) {
        console.error(e);
    }
}

seed();
