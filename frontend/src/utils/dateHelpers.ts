export const calculateAge = (dateString?: string | null): number => {
    if (!dateString) return 0
    const birth = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate()))
        age--

    return age
}