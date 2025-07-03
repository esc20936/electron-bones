export const uploadFile = async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file)) // key must be `files`

    const response = await fetch('/api/py/merge-csvs', {
        method: 'POST',
        body: formData,
    })


    if (!response.ok) {
        throw new Error('Error al subir el archivo')
    }

    return await response.json()
}