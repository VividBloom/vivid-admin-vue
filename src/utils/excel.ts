import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface ExcelHeader {
  key: string
  title: string
}

export interface ExportExcelParams {
  header: ExcelHeader[]
  data: any[]
  filename?: string
  autoWidth?: boolean
  bookType?: XLSX.BookType
}

export const exportExcel = ({
  header,
  data,
  filename = 'export-data',
  autoWidth = true,
  bookType = 'xlsx',
}: ExportExcelParams) => {
  if (!data || data.length === 0) {
    return
  }

  // 1. 构建数据数组，第一行为表头
  const arrData = data.map(item => {
    return header.map(h => item[h.key])
  })
  const headerTitles = header.map(h => h.title)
  arrData.unshift(headerTitles)

  // 2. 创建 Worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(arrData)

  // 3. 设置列宽
  if (autoWidth && arrData.length > 0 && arrData[0]) {
    const colWidths = arrData[0].map((_, i) => {
      let maxWidth = 0
      arrData.forEach(row => {
        const cellValue = row[i] ? String(row[i]) : ''
        // 中文占2个字符宽度，英文1个
        // eslint-disable-next-line no-control-regex
        const cellLen = cellValue.replace(/[^\x00-\xff]/g, 'aa').length
        if (cellLen > maxWidth) {
          maxWidth = cellLen
        }
      })
      return { wch: maxWidth + 2 }
    })
    worksheet['!cols'] = colWidths
  }

  // 4. 创建 Workbook 并写入
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // 5. 生成二进制流并下载
  const wbout = XLSX.write(workbook, {
    bookType: bookType,
    bookSST: false,
    type: 'binary',
  })

  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff
    }
    return buf
  }

  saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), `${filename}.${bookType}`)
}

export const readExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          reject(new Error('Excel file has no sheets'))
          return
        }
        const worksheet = workbook.Sheets[firstSheetName]
        if (!worksheet) {
          reject(new Error('First sheet is empty'))
          return
        }
        const results = XLSX.utils.sheet_to_json(worksheet)
        resolve(results)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = error => reject(error)
    reader.readAsArrayBuffer(file)
  })
}
