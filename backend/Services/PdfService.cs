using backend.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Drawing; 
using backend.Services.Interfaces;

namespace backend.Services;

public class PdfService : IPdfService
{
    private static readonly string PrimaryColor = "#4E61F6";   
    private static readonly string SecondaryColor = "#E0E7FF";
    private static readonly string BlackColor = "#111827";    
    private static readonly string DarkGrayColor = "#4B5563"; 
    private static readonly string LightGrayColor = "#F3F4F6";
    private static readonly string FooterBgColor = "#F8FAFC";  

    public PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
        
        try
        {
            var fontPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "fonts", "Roboto-Regular.ttf");
            if (File.Exists(fontPath)) FontManager.RegisterFont(File.OpenRead(fontPath));
            
            var fontBoldPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "fonts", "Roboto-Medium.ttf");
            if (File.Exists(fontBoldPath)) FontManager.RegisterFont(File.OpenRead(fontBoldPath));
        }
        catch (Exception ex) { Console.WriteLine($"[PDF] Warning: {ex.Message}"); }
    }

    public byte[] GenerateCertificate(UserPackage sub, ApplicationUser user)
    {
        if (sub == null || user == null)
        {
            throw new ArgumentNullException("Brak danych do wygenerowania PDF.");
        }

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0); 
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Roboto", "Arial").FontColor(BlackColor));

                page.Content().PaddingHorizontal(1.5f, Unit.Centimetre).PaddingTop(1.5f, Unit.Centimetre)
                    .Column(col =>
                    {
                        ComposeHeader(col.Item(), sub);
                        ComposeBody(col.Item(), sub, user);
                    });

                page.Footer().Element(ComposeFooter);
            });
        }).GeneratePdf();
    }

    private void ComposeHeader(IContainer container, UserPackage sub)
    {
        container.Column(column => 
        {
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("POLISA MEDYCZNA")
                        .FontSize(22).FontColor(BlackColor);
                    
                    col.Item().PaddingTop(2).Text(t =>
                    {
                        t.Span("NR: ").FontSize(10).Bold().FontColor(PrimaryColor);
                        t.Span(sub.TransactionId ?? "OCZEKIWANIE").FontSize(10).Bold().FontColor(PrimaryColor);
                    });
                });

                row.ConstantItem(50).AlignRight().Element(e => 
                {
                    e.Width(14, Unit.Millimetre)
                     .Height(14, Unit.Millimetre)
                     .Background(PrimaryColor)
                     .CornerRadius(3, Unit.Point)
                     .AlignCenter()
                     .AlignMiddle()
                     .PaddingBottom(1)
                     .Text("M")
                     .FontSize(24)
                     .Bold()
                     .FontColor(Colors.White);
                });
            });

            column.Item().PaddingTop(10).LineHorizontal(0.5f).LineColor("#E5E7EB");
        });
    }

    private void ComposeBody(IContainer container, UserPackage sub, ApplicationUser user)
    {
        container.PaddingTop(20).Column(col =>
        {
            DrawSectionHeader(col, "OKRES UBEZPIECZENIA");
            col.Item().PaddingTop(5).PaddingBottom(15).Row(row => 
            {
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Początek ochrony:").FontColor(DarkGrayColor);
                    c.Item().Text($"{sub.StartDate:dd.MM.yyyy}").Bold().FontColor(BlackColor);
                });
                
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text("Koniec ochrony:").FontColor(DarkGrayColor);
                    c.Item().Text($"{sub.EndDate:dd.MM.yyyy}").Bold().FontColor(BlackColor);
                });
            });

            DrawSectionHeader(col, "DANE UBEZPIECZONEGO");
            col.Item().PaddingTop(5).PaddingBottom(15).Column(c =>
            {
                c.Item().Row(r => {
                    r.ConstantItem(120).Text("Imię i Nazwisko:").FontColor(DarkGrayColor);
                    r.RelativeItem().Text($"{user.FirstName} {user.LastName}".ToUpper()).Bold().FontColor(BlackColor);
                });

                c.Item().PaddingTop(4).Row(r => {
                    r.ConstantItem(120).Text("PESEL:").FontColor(DarkGrayColor);
                    
                    string pesel = sub.GetType().GetProperty("Pesel")?.GetValue(sub, null) as string ?? user.Pesel ?? "BRAK DANYCH";
                    
                    r.RelativeItem().Text(pesel).Bold().FontColor(BlackColor);
                });

                if (!string.IsNullOrEmpty(sub.Street))
                {
                    c.Item().PaddingTop(4).Row(r => {
                        r.ConstantItem(120).Text("Adres:").FontColor(DarkGrayColor);
                        r.RelativeItem().Text($"ul. {sub.Street} {sub.HouseNumber}, {sub.ZipCode} {sub.City}")
                            .Bold().FontColor(BlackColor);
                    });
                }
            });
            
            DrawSectionHeader(col, "PRZEDMIOT UBEZPIECZENIA");
            
            col.Item().PaddingTop(5).Background(LightGrayColor).Padding(10).Row(row =>
            {
                row.RelativeItem().Text(sub.Package?.Name ?? "Pakiet").Bold().FontColor(BlackColor);
                row.ConstantItem(100).AlignRight().Text(sub.PriceAtPurchase).FontColor(PrimaryColor);
            });

            col.Item().PaddingTop(8).PaddingBottom(15)
                .Text($"Metoda płatności: {(sub.PaymentMethod ?? "Karta").ToUpper()}")
                .FontSize(9).FontColor(DarkGrayColor); 

            DrawSectionHeader(col, "ZAKRES ŚWIADCZEŃ");
            col.Item().PaddingTop(5).PaddingBottom(10).Column(c =>
            {
                if (sub.Package?.Features != null && sub.Package.Features.Any())
                {
                    foreach (var feature in sub.Package.Features)
                    {
                        c.Item().PaddingBottom(4).Row(r =>
                        {
                            r.ConstantItem(15).PaddingTop(4).Element(e => 
                                e.Height(4).Width(4).Background(PrimaryColor).CornerRadius(2)
                            );
                            r.RelativeItem().Text($"{feature}").FontColor(BlackColor);
                        });
                    }
                }
                else
                {
                    c.Item().Text("Pełny zakres usług medycznych zgodnie z Regulaminem.").FontColor(DarkGrayColor);
                }
            });

            DrawSectionHeader(col, "POSTANOWIENIA DODATKOWE");
            col.Item().PaddingTop(5).Text(
                "Niniejszy certyfikat potwierdza zawarcie umowy ubezpieczenia zdrowotnego w systemie Medisure. " +
                "Ochrona świadczona jest przez Medisure Polska Sp. z o.o. zgodnie z Ogólnymi Warunkami Ubezpieczenia (OWU). " +
                "W przypadku nagłych zachorowań prosimy o kontakt z infolinią 24/7. " +
                "Dokument wygenerowany elektronicznie, nie wymaga podpisu ani pieczęci.")
                .FontSize(8).FontColor(DarkGrayColor).Justify();
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container
            .Background(FooterBgColor)
            .PaddingVertical(15)
            .PaddingHorizontal(1.5f, Unit.Centimetre)
            .Column(col =>
            {
                col.Item().LineHorizontal(0.5f).LineColor(PrimaryColor);
                
                col.Item().PaddingTop(10).Row(row =>
                {
                    row.RelativeItem().Text($"Dokument wygenerowany przez system Medisure © {DateTime.Now.Year}")
                        .FontSize(8).FontColor(DarkGrayColor);
                    
                    row.RelativeItem().AlignRight().Column(c =>
                    {
                        c.Item().AlignRight().Text("MEDISURE POLSKA SP. Z O.O.")
                            .FontSize(8).Bold().FontColor(PrimaryColor);
                        c.Item().AlignRight().Text("NIP: 1237004852")
                            .FontSize(8).FontColor(DarkGrayColor);
                        c.Item().AlignRight().Text($"Data wystawienia: {DateTime.Now:dd.MM.yyyy, HH:mm:ss}")
                            .FontSize(8).FontColor(DarkGrayColor);
                        c.Item().AlignRight().Text("ul. Grochowska 21, 61-001 Poznań")
                            .FontSize(8).FontColor(DarkGrayColor);
                    });
                });
            });
    }

    private void DrawSectionHeader(ColumnDescriptor col, string title)
    {
        col.Item().PaddingBottom(5).Element(e =>
        {
            e.Background(SecondaryColor)
             .Height(20)
             .Row(r =>
             {
                 r.ConstantItem(3).Background(PrimaryColor); 
                 
                 r.RelativeItem().AlignMiddle().PaddingLeft(10).Text(title.ToUpper())
                     .FontSize(10).Bold().FontColor(PrimaryColor);
             });
        });
    }
}