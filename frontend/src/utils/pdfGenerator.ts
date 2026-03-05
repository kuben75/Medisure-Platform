import jsPDF from 'jspdf';
import type {ExtendedSubscription} from "../types/pricing.types.ts";

const loadLocalFont = async (filename: string): Promise<string> => {
    const url = `${window.location.origin}/fonts/${filename}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Nie znaleziono czcionki: ${filename}`);
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.readAsDataURL(blob);
    });
};

export const generatePolicyPDF = async (
    sub: ExtendedSubscription,
    userName: string,
    userPesel?: string
) => {
    const doc = new jsPDF();

    try {
        const fontRegular = await loadLocalFont("Roboto-Regular.ttf");
        const fontBold = await loadLocalFont("Roboto-Medium.ttf");

        doc.addFileToVFS("Roboto-Regular.ttf", fontRegular);
        doc.addFileToVFS("Roboto-Bold.ttf", fontBold);

        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

        doc.setFont("Roboto");
    } catch (e) {
        console.error("Błąd ładowania czcionek, używanie domyślnych: ", e);
        doc.setFont("helvetica");
    }

    const primaryColor = "#4E61F6";
    const secondaryColor = "#E0E7FF";
    const blackColor = "#111827";
    const darkGray = "#4B5563";
    const lightGray = "#f3f4f6";
    const footerBg = "#F8FAFC";

    const logoSize = 14;
    const logoX = 180;
    const logoY = 10;
    const borderRadius = 3;

    doc.setFillColor(primaryColor);
    doc.roundedRect(logoX, logoY, logoSize, logoSize, borderRadius, borderRadius, 'F');

    doc.setTextColor(whiteColor);
    doc.setFontSize(24);
    doc.setFont("Roboto", "bold");
    doc.text("M", logoX + (logoSize / 2), logoY + (logoSize / 2) - 0.1, {align: 'center', baseline: 'middle'});

    doc.setTextColor(blackColor);
    doc.setFontSize(22);
    doc.text("POLISA MEDYCZNA", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setFont("Roboto", "bold");
    doc.text(`NR: ${sub.transactionId || 'OCZEKIWANIE'}`, 15, 26);

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(15, 33, 195, 33);

    let currentY = 50;

    const drawSectionHeader = (title: string, y: number) => {
        doc.setFillColor(secondaryColor);
        doc.rect(15, y - 6, 180, 8, 'F');
        doc.setFillColor(primaryColor);
        doc.rect(15, y - 6, 2, 8, 'F');
        doc.setTextColor(primaryColor);
        doc.setFontSize(10);
        doc.setFont("Roboto", "bold");
        doc.text(title.toUpperCase(), 20, y - 1);
        return y + 10;
    };

    currentY = drawSectionHeader("Okres ubezpieczenia", currentY);

    const startDateObj = new Date(sub.startDate);
    const endDateObj = new Date(sub.endDate);


    if (startDateObj.getDate() === endDateObj.getDate()) {
        endDateObj.setDate(endDateObj.getDate() - 1);
    }

    const startDateStr = startDateObj.toLocaleDateString('pl-PL');
    const endDateStr = endDateObj.toLocaleDateString('pl-PL');

    doc.setTextColor(darkGray);
    doc.setFont("Roboto", "normal");

    doc.text("Początek ochrony:", 15, currentY);
    doc.setTextColor(blackColor);
    doc.setFont("Roboto", "bold");
    doc.text(startDateStr, 60, currentY);

    doc.setTextColor(darkGray);
    doc.setFont("Roboto", "normal");
    doc.text("Koniec ochrony:", 100, currentY);
    doc.setTextColor(blackColor);
    doc.setFont("Roboto", "bold");
    doc.text(endDateStr, 140, currentY);

    const isSubscription = (sub.paymentMethod || '').toLowerCase() === 'card' || sub.price.includes('/ mies');

    if (isSubscription) {
        currentY += 6;
        doc.setFontSize(8);
        doc.setTextColor("#059669");
        doc.setFont("Roboto", "bold");
        doc.text("(Polisa odnawialna automatycznie. Okres ochrony przedłuża się po opłaceniu kolejnej składki.)", 15, currentY);
        doc.setFontSize(10);
    }

    currentY += 15;

    currentY = drawSectionHeader("Dane ubezpieczonego", currentY);

    doc.setTextColor(darkGray);
    doc.setFont("Roboto", "normal");
    doc.text("Imię i Nazwisko:", 15, currentY);
    doc.setTextColor(blackColor);
    doc.setFont("Roboto", "bold");
    doc.text(userName.toUpperCase(), 60, currentY);

    currentY += 6;
    doc.setTextColor(darkGray);
    doc.setFont("Roboto", "normal");
    doc.text("PESEL:", 15, currentY);
    doc.setTextColor(blackColor);
    doc.setFont("Roboto", "bold");

    const finalPesel = sub.pesel || userPesel || "BRAK DANYCH";
    doc.text(finalPesel, 60, currentY);

    if (sub.street && sub.city) {
        currentY += 6;
        doc.setTextColor(darkGray);
        doc.setFont("Roboto", "normal");
        doc.text("Adres:", 15, currentY);
        doc.setTextColor(blackColor);
        doc.setFont("Roboto", "bold");
        const fullAddress = `ul. ${sub.street} ${sub.houseNumber}, ${sub.zipCode} ${sub.city}`;
        doc.text(fullAddress, 60, currentY);
    }

    currentY += 15;

    currentY = drawSectionHeader("Przedmiot ubezpieczenia", currentY);

    doc.setFillColor(lightGray);
    doc.rect(15, currentY - 4, 180, 10, 'F');

    doc.setTextColor(blackColor);
    doc.setFont("Roboto", "bold");
    doc.text(sub.packageName, 20, currentY + 2);

    doc.setTextColor(primaryColor);
    doc.text(sub.price, 160, currentY + 2);
    doc.setTextColor(blackColor);

    currentY += 12;
    doc.setFontSize(9);
    doc.setTextColor(darkGray);
    doc.setFont("Roboto", "normal");
    doc.text(`Metoda płatności: ${(sub.paymentMethod || 'Karta').toUpperCase()}`, 15, currentY);
    doc.setFontSize(10);

    currentY += 15;

    currentY = drawSectionHeader("Zakres świadczeń", currentY);

    const featuresList = typeof sub.features === 'string'
        ? sub.features.split(';').map(f => f.trim()).filter(Boolean)
        : (Array.isArray(sub.features) ? sub.features : []);

    if (featuresList.length > 0) {
        featuresList.forEach((feature) => {
            if (currentY > 280) {
                doc.addPage();
                currentY = 20;
            }
            doc.setFillColor(primaryColor);
            doc.circle(18, currentY - 1, 1, 'F');

            doc.setTextColor(blackColor);
            doc.setFont("Roboto", "normal");
            doc.text(feature, 24, currentY);
            currentY += 6;
        });
    }
    else {
        doc.setTextColor(darkGray);
        doc.text("Pełny zakres usług medycznych zgodnie z Regulaminem.", 15, currentY);
        currentY += 6;
    }

    currentY += 10;

    currentY = drawSectionHeader("Postanowienia dodatkowe", currentY);

    doc.setFontSize(8);
    doc.setTextColor(darkGray);

    const provisions = "Niniejszy certyfikat potwierdza zawarcie umowy ubezpieczenia zdrowotnego w systemie Medisure. " +
        "Ochrona świadczona jest przez Medisure Polska Sp. z o.o. zgodnie z Ogólnymi Warunkami Ubezpieczenia (OWU). " +
        "W przypadku nagłych zachorowań prosimy o kontakt z infolinią 24/7. " +
        "Dokument wygenerowany elektronicznie, nie wymaga podpisu ani pieczęci.";

    const splitProvisions = doc.splitTextToSize(provisions, 180);
    doc.text(splitProvisions, 15, currentY);

    const pageHeight = doc.internal.pageSize.height;

    doc.setFillColor(footerBg);
    doc.rect(0, pageHeight - 40, 210, 40, 'F');

    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(0, pageHeight - 40, 210, pageHeight - 40);

    doc.setFontSize(8);
    doc.setTextColor(darkGray);

    const now = new Date().toLocaleString('pl-PL');
    doc.text(`Dokument wygenerowany: ${now}`, 15, pageHeight - 20);

    doc.setFont("Roboto", "bold");
    doc.setTextColor(primaryColor);
    doc.text("MEDISURE POLSKA SP. Z O.O.", 195, pageHeight - 32, {align: 'right'});

    doc.setFont("Roboto", "normal");
    doc.setTextColor(darkGray);
    doc.text("NIP: 1237004852", 195, pageHeight - 27, {align: 'right'});
    doc.text(`Data wystawienia: ${now}`, 195, pageHeight - 22, {align: 'right'});
    doc.text("ul. Grochowska 21, 61-001 Poznań", 195, pageHeight - 17, {align: 'right'});

    const safeFileName = sub.packageName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`Polisa_Medisure_${safeFileName}.pdf`);
};
const whiteColor = "#ffffff"