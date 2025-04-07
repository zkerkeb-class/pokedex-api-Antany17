import fs from 'fs'

const saveJson = (data,path) => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

export default saveJson