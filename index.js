const root = document.documentElement.style
const app = document.getElementById("root")
const cursor = document.querySelector('.cursor')
const pageTransition = document.querySelectorAll('.page-transition')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const PAGE_TITLE = "Yummy Fran Palomares"
const PASSCODE = "manifestflat1"
const MAX_SQUARES = 8

let squares = []
let light = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const routes = {
    '/': {
        component: './pages/Home.html',
        title: PAGE_TITLE
    },
    welcome: {
        component: './pages/Hero.html',
        title: "Welcome"
    },
    auth: {
        component: './pages/Authentication.html',
        title: 'Authentication'
    }
}

const router = async () => {
    const location = window.location.hash.replace("#", "")
    const path = location.length == 0 || ['/index.html', 'home'].includes(location) ? '/' : location
    
    if (!routes[path]) return

    const { component, title } = routes[path]
    const html = await fetch(component).then(res => res.text()) 

    app.innerHTML = html
    document.title = title
}

const animatePageTransition = e => {
    let ref = e

    if(e.target) {
        e.preventDefault()
        ref = e.target.href
    }

    pageTransition.forEach(el => {
        el.classList.remove("swipe-out")
        el.classList.add("swipe-in")
    })

    setTimeout(() => {
        pageTransition.forEach(el => {
            window.location.replace(ref)
            el.classList.remove("swipe-in")
            el.classList.add("swipe-out")
        })
    }, 700)
}

const handleMouseMove = e => {
    light.x = e.clientX
    light.y = e.clientY

   root.setProperty('--light-x', `${light.x}px`)
   root.setProperty('--light-y', `${light.y}px`)

   cursor.style.left = `${light.x}px`
   cursor.style.top = `${light.y}px`
}

const handlePasscodeSubmit = e => {
    event.preventDefault()
    const [name, password] = document.querySelectorAll('.auth-input')

    if(password.value == PASSCODE) {
        localStorage.setItem('isLoggedIn', 'true')
        animatePageTransition('/')
    } else {
        alert("no")
    }
}

const navigate = e => {
    if (e.target.matches('.link')) {
        animatePageTransition(e)
    }
}

const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    squares.forEach(box => {
        box.rotate()
        box.drawShadow(light)
    });

    squares.forEach(box => {
        box.draw()
    })

    requestAnimationFrame(animate)
}

const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

const isLoggedIn = () => {
    return JSON.parse(localStorage.getItem('isLoggedIn'))
}

const authenticate = () => {
    if(!isLoggedIn()) window.location.replace('#welcome')
}

const init = () => {
    console.log("init")
    // if(!isLoggedIn()) window.location.replace('#welcome')
    authenticate()
    router()
    resize()
    while (squares.length < MAX_SQUARES) {
        squares.push(new Box())
    }
    animate()
}

window.addEventListener("hashchange", router)
window.addEventListener('mousemove', handleMouseMove)
window.addEventListener('resize', resize)
document.addEventListener('click', navigate)

class Box {
    constructor() {
        this.half_size = Math.floor((Math.random() * Math.floor(canvas.width * 0.04)) + Math.floor(canvas.width * 0.02))
        this.x = Math.floor((Math.random() * canvas.width) + 1)
        this.y = Math.floor((Math.random() * canvas.height) + 1)
        this.velocityX = (Math.random() * 4) - 2
        this.velocityY = (Math.random() * 4) - 2
        this.rotation = Math.random() * Math.PI
        this.shadow_length = 2000
        this.colors = ["#183D3D", "#5C8374"]
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)]
    }

    getDots() {
        const full = (Math.PI * 2) / 4
        const { x, y, rotation, half_size } = this

        const calculateDot = (offset) => ({
            x: x + half_size * Math.sin(rotation + full * offset),
            y: y + half_size * Math.cos(rotation + full * offset)
        });

        return {
            p1: calculateDot(0),
            p2: calculateDot(1),
            p3: calculateDot(2),
            p4: calculateDot(3)
        };
    }

    rotate() {
        const speed = (60 - this.half_size) / 20
        this.rotation += speed * 0.002
        this.x += this.velocityX
        this.y += this.velocityY
    }

    draw() {
        const dots = this.getDots()

        ctx.beginPath();
        ctx.moveTo(dots.p1.x, dots.p1.y)
        ctx.lineTo(dots.p2.x, dots.p2.y)
        ctx.lineTo(dots.p3.x, dots.p3.y)
        ctx.lineTo(dots.p4.x, dots.p4.y)
        ctx.fillStyle = this.color
        ctx.fill()

        if (this.y - this.half_size > canvas.height) {
            this.y -= canvas.height + this.half_size * 2
        }
        if(this.y + this.half_size < 0) {
            this.y += canvas.height + this.half_size * 2
        }
        if (this.x - this.half_size > canvas.width) {
            this.x -= canvas.width; + this.half_size * 2
        }
        if(this.x + this.half_size < 0) {
            this.x += canvas.width + this.half_size * 2
        }
    }

    drawShadow(light) {
        const dots = this.getDots()
        const points = Object.values(dots).map(dot => {
            const angle = Math.atan2(light.y - dot.y, light.x - dot.x)
            const endX = dot.x + this.shadow_length * Math.sin(-angle - Math.PI / 2)
            const endY = dot.y + this.shadow_length * Math.cos(-angle - Math.PI / 2)
            return {
                endX,
                endY,
                startX: dot.x,
                startY: dot.y
            }
        })

        ctx.fillStyle = "#040D12BB";
        for (let i = points.length - 1; i >= 0; i--) {
            const n = i === 3 ? 0 : i + 1
            ctx.beginPath();
            ctx.moveTo(points[i].startX, points[i].startY)
            ctx.lineTo(points[n].startX, points[n].startY)
            ctx.lineTo(points[n].endX, points[n].endY)
            ctx.lineTo(points[i].endX, points[i].endY)
            ctx.fill();
        }
    }
}

init()