const operationScreen = document.getElementById('operationScreen')
const mainScreen = document.getElementById('mainScreen')

const printables = document.querySelectorAll('.printable')
const convertions = document.querySelectorAll('.convertion')
const digits = document.querySelectorAll('.digit')

const hex = document.getElementById('hexValue')
const dec = document.getElementById('decValue')
const oct = document.getElementById('octValue')
const bin = document.getElementById('binValue')

let calculations = '0'
let isOperator = false
let leftParenthesis = 0
let rightParenthesis = 0
let active = 'dec'

printables.forEach(btn => btn.addEventListener('click', () => {
    calculations += btn.value == '(' ? '*' : ""
    calculations = calculations[0] == '0' ? btn.value : calculations + btn.value
    printText(btn.innerText)
    update()
}))

convertions.forEach(cnv => {
    cnv.addEventListener('click', e => {
        convertions.forEach(opt => {
            opt.classList.remove('active')
        })

        active = e.currentTarget.id

        switch(active) {
            case 'dec' :
                mainScreen.value = dec.innerText
                break
            case 'bin' :
                mainScreen.value = bin.innerText
                break
            case 'oct' :
                mainScreen.value = oct.innerText
                break
            case 'hex' :
                mainScreen.value = hex.innerText
                break
        }

        e.currentTarget.classList.add('active')
        update()
    })
})

function printText(data) {
    if(['÷','×','-','+','%','(',')','='].includes(data)) {
        if(data == '(') leftParenthesis++
        if(data == ')') rightParenthesis++
        if(isOperator) {
            calculations = calculations.slice(0, -2) + data
        }
        operationScreen.value = calculations.replaceAll('*', ' × ').replaceAll('/',' ÷ ').replaceAll('-', ' - ').replaceAll('+', ' + ').replaceAll('=', ' = ')
        
        if(leftParenthesis != rightParenthesis || leftParenthesis == 0) isOperator = true
    } else {
        mainScreen.value = mainScreen.value[0] == '0' || isOperator ? data : mainScreen.value + data
        isOperator = false
    }
}

function del() {
    calculations = mainScreen.value != '0' ? calculations.slice(0, -1) :  calculations
    mainScreen.value = mainScreen.value.length == 1 ? '0' : mainScreen.value.slice(0,-1)
    update()
}

function clearScreen() {
    if(mainScreen.value == '0') {
        operationScreen.value = ""
        calculations = '0'
    }
    mainScreen.value = '0'
    update()
}

function calculate() {
    let result = eval(calculations)

    mainScreen.value = result
}

function update() {
    switch(active) {
        case 'dec' :
            decimalTo(mainScreen.value)
            break
        case 'bin' :
            binaryTo(mainScreen.value)
            break
        case 'oct' :
            octalTo(mainScreen.value)
            break
        case 'hex' :
            hexadecimalTo(mainScreen.value)
            break
    }
}

function decimalTo(number) {
    digits.forEach(digit => isNaN(parseInt(digit.value)) ? digit.disabled = true : digit.disabled = false )

    dec.innerText = number
    bin.innerText = decimalConverter(number, 2) || 0
    oct.innerText = decimalConverter(number, 8) || 0
    hex.innerText = decimalConverter(number, 16) || 0
}

function binaryTo(number) {
    digits.forEach(digit => digit.value <= 1 ? digit.disabled = false : digit.disabled = true)

    bin.innerText = number
    dec.innerText = binaryConverter(number, 10) || 0
    oct.innerText = binaryConverter(number, 8) || 0
    hex.innerText = binaryConverter(number, 16) || 0
}

function octalTo(number) {
    digits.forEach(digit => digit.value <= 7 ? digit.disabled = false : digit.disabled = true)

    oct.innerText = number
    dec.innerText = octalConverter(number, 10) || 0
    bin.innerText = octalConverter(number, 2) || 0
    hex.innerText = octalConverter(number, 16) || 0
}

function hexadecimalTo(number) {
    digits.forEach(digit => digit.disabled = false)

    hex.innerText = number
    dec.innerText = hexadecimalConverter(number, 10) || 0
    bin.innerText = hexadecimalConverter(number, 2) || 0
    oct.innerText = hexadecimalConverter(number, 8) || 0
}

function decimalConverter(number, base) {
    let output = ''
    let quotient = number

    while(quotient > 0) {
        let remainder = quotient % base
        output = (base == 16 ? toHexDigit(remainder) : remainder) + output
        quotient = Math.floor(quotient/base)
    }

    return output
}

function binaryConverter(number, base) {
    let output = '';
    let decimalValue = 0;
    let power = 0;

    while (number > 0) {
        let digit = number % 10;
        decimalValue += digit * Math.pow(2, power);
        power++;
        number = Math.floor(number / 10);
    }

    while (decimalValue > 0) {
        let remainder = decimalValue % base;
        output = (base == 16 ? toHexDigit(remainder) : remainder) + output;
        decimalValue = Math.floor(decimalValue / base);
    }

    return output !== '' ? output : '0';
}

function octalConverter(octalNumber, base) {
    let output = '';
    let decimalValue = 0;
    let power = 0;

    while (octalNumber > 0) {
        let digit = octalNumber % 10;
        decimalValue += digit * Math.pow(8, power);
        power++;
        octalNumber = Math.floor(octalNumber / 10);
    }

    while (decimalValue > 0) {
        let remainder = decimalValue % base;
        output = (base == 16 ? toHexDigit(remainder) : remainder) + output;
        decimalValue = Math.floor(decimalValue / base);
    }

    return output !== '' ? output : '0';
}

function hexadecimalConverter(hexNumber, base) {
    let output = '';
    let decimalValue = 0;
    let power = 0;

    for (let i = hexNumber.length - 1; i >= 0; i--) {
        let digit = isNaN(hexNumber[i]) ? hexNumber[i].toUpperCase().charCodeAt(0) - 55 : parseInt(hexNumber[i]);
        decimalValue += digit * Math.pow(16, power);
        power++;
    }

    while (decimalValue > 0) {
        let remainder = decimalValue % base;
        output = (base == 16 ? toHexDigit(remainder) : remainder) + output;
        decimalValue = Math.floor(decimalValue / base);
    }

    return output !== '' ? output : '0';
}

function toHexDigit(remainder) {
    if (remainder >= 10 && remainder <= 15) {
        return String.fromCharCode(remainder + 55)
    }
    return remainder;
}

