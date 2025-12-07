import jsPDF from 'jspdf'
import type { IUserSubscription } from '../types/user.types.ts'

const loadLocalFont = async (filename: string): Promise<string> => {
    const url = `${window.location.origin}/fonts/${filename}`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Nie znaleziono czcionki: ${filename}`)
    const blob = await response.blob()
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
        }
        reader.readAsDataURL(blob)
    })
}

export const generatePolicyPDF = async (
    sub: IUserSubscription,
    userName: string,
    userPesel?: string
) => {
    const doc = new jsPDF()

    try {
        const fontRegular = await loadLocalFont("Roboto-Regular.ttf")
        const fontBold = await loadLocalFont("Roboto-Medium.ttf")

        doc.addFileToVFS("Roboto-Regular.ttf", fontRegular)
        doc.addFileToVFS("Roboto-Bold.ttf", fontBold)

        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal")
        doc.addFont("Roboto-Bold.ttf", "Roboto", "bold")

        doc.setFont("Roboto")
    } catch (e) {
        console.warn("Błąd ładowania lokalnej czcionki. Używam Helvetica (brak PL znaków).", e)
        doc.setFont("helvetica")
    }

    const primaryColor = "#4E61F6"
    const blackColor = "#1f2937"
    const whiteColor = "#ffffff"
    const grayColor = "#f3f4f6"

    const logoX = 185
    const logoY = 20

    doc.setFillColor(primaryColor)
    doc.circle(logoX, logoY, 12, 'F')
    doc.setTextColor(whiteColor)
    doc.setFontSize(22)
    doc.setFont("Roboto", "bold")
    doc.text("M", logoX, logoY + 1, { align: 'center', baseline: 'middle' })

    doc.setTextColor(blackColor)
    doc.setFontSize(18)
    doc.text("CERTYFIKAT", 15, 20)

    doc.setFontSize(10)
    doc.setFont("Roboto", "normal")
    doc.text("POLISA UBEZPIECZENIA MEDYCZNEGO", 15, 26)

    doc.setFont("Roboto", "bold")
    doc.text(`NR POLISY: ${sub.transactionId || 'OCZEKIWANIE'}`, 15, 32)

    let currentY = 50

    const drawSectionHeader = (num: string, title: string, y: number) => {
        doc.setFillColor(blackColor)
        doc.rect(15, y, 8, 8, 'F')
        doc.setTextColor(whiteColor)
        doc.setFontSize(10)
        doc.setFont("Roboto", "bold")
        doc.text(num, 19, y + 4, { align: 'center', baseline: 'middle' })
        doc.setFillColor(grayColor)
        doc.rect(23, y, 172, 8, 'F')
        doc.setTextColor(blackColor)
        doc.text(title.toUpperCase(), 28, y + 5.5)
        return y + 16
    }

    currentY = drawSectionHeader("1", "Okres ubezpieczenia", currentY)

    doc.setFont("Roboto", "normal")
    doc.setFontSize(10)
    const startDate = new Date(sub.startDate).toLocaleDateString('pl-PL')
    const endDate = new Date(sub.endDate).toLocaleDateString('pl-PL')

    doc.text("Początek ochrony:", 15, currentY)
    doc.setFont("Roboto", "bold")
    doc.text(startDate, 60, currentY)

    doc.setFont("Roboto", "normal")
    doc.text("Koniec ochrony:", 100, currentY)
    doc.setFont("Roboto", "bold")
    doc.text(endDate, 140, currentY)

    currentY += 12

    currentY = drawSectionHeader("2", "Ubezpieczony", currentY)

    doc.setFont("Roboto", "bold")
    doc.text("Imię i Nazwisko:", 15, currentY)
    doc.setFont("Roboto", "normal")
    doc.text(userName.toUpperCase(), 65, currentY)

    currentY += 6
    doc.setFont("Roboto", "bold")
    doc.text("PESEL:", 15, currentY)
    doc.setFont("Roboto", "normal")
    doc.text(userPesel || "BRAK DANYCH", 65, currentY)

    if (sub.street && sub.city) {
        currentY += 6
        doc.setFont("Roboto", "bold")
        doc.text("Adres:", 15, currentY)
        doc.setFont("Roboto", "normal")
        const fullAddress = `ul. ${sub.street} ${sub.houseNumber}, ${sub.zipCode} ${sub.city}`
        doc.text(fullAddress, 65, currentY)
    }

    currentY += 12

    currentY = drawSectionHeader("3", "Przedmiot ubezpieczenia", currentY)

    doc.setFont("Roboto", "bold")
    doc.text("Nazwa Pakietu", 15, currentY)
    doc.text("Składka", 150, currentY)

    currentY += 4
    doc.setDrawColor(200, 200, 200)
    doc.line(15, currentY, 195, currentY)
    currentY += 6

    doc.setFont("Roboto", "normal")
    doc.text(sub.packageName, 15, currentY)

    doc.text(sub.price, 150, currentY)

    currentY += 6
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Metoda płatności: ${(sub.paymentMethod || 'Karta').toUpperCase()}`, 15, currentY)
    doc.setTextColor(blackColor)
    doc.setFontSize(10)

    currentY += 14

    currentY = drawSectionHeader("4", "Zakres ubezpieczenia", currentY)

    if (sub.features && sub.features.length > 0) {
        sub.features.forEach((feature) => {
            doc.setFillColor(blackColor)
            doc.circle(17, currentY - 1, 1, 'F')
            doc.text(feature, 22, currentY)
            currentY += 6
        })
    } else {
        doc.text("Pełny zakres usług medycznych zgodnie z Regulaminem.", 15, currentY)
        currentY += 6
    }

    currentY += 6

    currentY = drawSectionHeader("5", "Postanowienia dodatkowe", currentY)

    doc.setFontSize(8)
    const disclaimer =
        "Niniejszy certyfikat potwierdza zawarcie umowy ubezpieczenia zdrowotnego w systemie Medisure. " +
        "Ochrona świadczona jest przez Medisure Polska Sp. z o.o. zgodnie z Ogólnymi Warunkami Ubezpieczenia (OWU). " +
        "W przypadku nagłych zachorowań prosimy o kontakt z infolinią 24/7. " +
        "Dokument wygenerowany elektronicznie, nie wymaga podpisu ani pieczęci."

    const splitDisclaimer = doc.splitTextToSize(disclaimer, 180)
    doc.text(splitDisclaimer, 15, currentY)

    const pageHeight = doc.internal.pageSize.height

    doc.setDrawColor(primaryColor)
    doc.setLineWidth(1.5)
    doc.line(15, pageHeight - 30, 195, pageHeight - 30)

    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)

    const now = new Date().toLocaleString('pl-PL')
    doc.text(`Dokument wygenerowany: ${now}`, 15, pageHeight - 20)

    doc.text("Medisure Polska Sp. z o.o. | NIP: 2137004852", 195, pageHeight - 20, { align: 'right' })
    doc.text("ul. Grochowska 21, 61-001 Poznań", 195, pageHeight - 15, { align: 'right' })

    const safeFileName = sub.packageName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    doc.save(`Polisa_Medisure_${safeFileName}.pdf`)
}