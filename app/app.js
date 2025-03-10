'use strict'

//Pages
import Home from './pages/home'
import About from './pages/about'
import Project from './pages/project'
import Photographies from './pages/photographies'
//Components
import Preloader from './components/Preloader'
import Player from './components/widgets/music-player/player'
import Navigation from './components/Navigation'
import FormHandler from './config/forms'
import Canvas from './animation/canvas'
import Smoothscroll from './utils/Smoothscroll'
import { $All, $ } from './utils/selectors'

class App {
  constructor() {
    this.createPreloader()
    this.initNavigation()
    this.init()
    this.getContent()
  }

  init() {
    this.player = new Player()
    this.canvas = new Canvas()
  }

  createPreloader() {
    this.preloader = new Preloader()
    this.preloader.once('completed', () => this.onPreloadEnd())
  }

  onPreloadEnd() {
    this.preloader.destroy()
    this.initPages()
    this.config()
    this.eventListener()
  }

  getContent() {
    this.content = document.querySelector('#content')
    this.template = this.content.getAttribute('data-template')
  }

  initPages() {
    this.pages = {
      home: new Home(),
      about: new About(),
      project: new Project(),
      photographies: new Photographies(),
    }

    this.page = this.pages[this.template]
    this.page.init()
    this.page.create()
    this.page.show()
  }

  initNavigation() {
    this.navigation = new Navigation()
  }

  config() {
    this.formHandler = new FormHandler('connect', 'connect', 'POST')
  }

  observer(element) {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        console.log(entry)
        new Smoothscroll($('.wrapper'), {
          direction: 'v',
          smooth: 0.1,
        })
      }
    })

    observer.observe(element)
  }

  async onChange({ url }) {
    await this.page.hide()

    const res = await window.fetch(url)

    if (res.status === 200) {
      const html = await res.text()

      window.history.pushState({}, '', url)

      const div = document.createElement('div')
      div.innerHTML = html

      const divContent = div.querySelector('.content')
      this.template = divContent.getAttribute('data-template')
      this.content.innerHTML = divContent.innerHTML
      this.page = this.pages[this.template]

      this.page.create()
      this.page.show()
    } else {
      console.error('error: ' + res)
    }
  }

  eventListener() {
    const links = $All('[data-links]')
    const linksItem = $All('.header__links__item__link')

    if (!links || !linksItem) return
    links.forEach((link) => {
      const { href } = link
      const linkData = href.split('#')
      const [url] = linkData
      const attribute = link.getAttribute('data-links-disabled')
      const isDisabled = attribute === 'true'

      link.onclick = (e) => {
        e.preventDefault()

        if (isDisabled) return

        if (link.classList.contains('menu__links__item-active')) {
          link.classList.remove('menu__links__item-active')
        } else {
          link.classList.add('menu__links__item-active')
        }

        if (url === window.location.href) return
        this.onChange({ url: href })
      }
    })
  }
}

// eslint-disable-next-line no-new
new App()
