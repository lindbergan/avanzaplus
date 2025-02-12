export class DomManipulator {
  selector: string

  constructor(selector: string) {
    this.selector = selector
  }

  getContainer(): HTMLElement | null {
    return document.querySelector(this.selector)
  }

  getTable(prefix: string = "", suffix: string = ""): HTMLTableElement | undefined | null {
    return this.getContainer()?.querySelector(`${prefix}table${suffix}`)
  }

  getTableHead(prefix: string = "", suffix: string = ""): HTMLTableSectionElement | undefined | null {
    return this.getTable()?.querySelector(`${prefix}thead${suffix}`)
  }

  getTableBody(prefix: string = "", suffix: string = ""): HTMLTableSectionElement | undefined | null {
    return this.getTable()?.querySelector(`${prefix}tbody${suffix}`)
  }
}