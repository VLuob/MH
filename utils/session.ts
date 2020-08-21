export default {
  get:  (key: string) => {
    const value = sessionStorage.getItem(key);
    return JSON.parse(value)
  },

  set:  (key: string, value: any): void => {
    if(value !== null && value !== undefined) {
      sessionStorage.setItem(key, JSON.stringify(value))
    }
  },

  remove: (key: string): void => {
    sessionStorage.removeItem(key)
  },

  clear: (): void => {
    sessionStorage.clear()
  }
}