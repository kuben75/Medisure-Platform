using backend.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Drawing;
namespace backend.Services;

public interface IPdfService
{
    byte[] GenerateCertificate(UserPackage sub, ApplicationUser user);
}

public class PdfService : IPdfService
{
    private static readonly string PrimaryColor = "#4E61F6";
    private static readonly string GrayColor = "#F3F4F6";
    private static readonly string BlackColor = "#1F2937";

    public PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;

        try
        {
            var fontPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "fonts", "Roboto-Regular.ttf");
            if (File.Exists(fontPath))
                FontManager.RegisterFont(File.OpenRead(fontPath));
            
            var fontBoldPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "fonts", "Roboto-Medium.ttf");
            if (File.Exists(fontBoldPath))
                FontManager.RegisterFont(File.OpenRead(fontBoldPath));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PDF] Warning: {ex.Message}");
        }
    }

    public byte[] GenerateCertificate(UserPackage sub, ApplicationUser user)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Roboto").Fallback(f => f.FontFamily("Arial")));

                page.Header().Element(compose => ComposeHeader(compose, sub));
                page.Content().Element(compose => ComposeContent(compose, sub, user));
                page.Footer().Element(compose => ComposeFooter(compose));
            });
        }).GeneratePdf();
    }

    private void ComposeHeader(IContainer container, UserPackage sub)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(col =>
            {
                col.Item().Text("CERTYFIKAT").FontSize(18).Bold().FontColor(BlackColor);
                col.Item().Text("POLISA UBEZPIECZENIA MEDYCZNEGO").FontSize(10);
                col.Item().PaddingTop(6).Text($"NR POLISY: {sub.TransactionId ?? "OCZEKIWANIE"}").FontSize(12).Bold();
            });

            row.ConstantItem(70).AlignRight().Element(e => 
            {
                e.Width(24, Unit.Millimetre)
                 .Height(24, Unit.Millimetre)
                 .Background(PrimaryColor)
                 .CornerRadius(12, Unit.Millimetre) 
                 .AlignCenter()
                 .AlignMiddle()
                 .Text("M")
                 .FontSize(22)
                 .Bold()
                 .FontColor(Colors.White);
            });
        });
    }

    private void ComposeContent(IContainer container, UserPackage sub, ApplicationUser user)
    {
        container.PaddingTop(15).Column(col =>
        {
            DrawSectionHeader(col, "1", "OKRES UBEZPIECZENIA");
            col.Item().PaddingLeft(5).Row(row => 
            {
                row.RelativeItem().Text(t =>
                {
                    t.Span("Początek ochrony: ");
                    t.Span($"{sub.StartDate:dd.MM.yyyy}").Bold();
                });
                
                row.RelativeItem().Text(t =>
                {
                    t.Span("Koniec ochrony: ");
                    t.Span($"{sub.EndDate:dd.MM.yyyy}").Bold();
                });
            });

            DrawSectionHeader(col, "2", "UBEZPIECZONY");
            col.Item().PaddingLeft(5).Column(c =>
            {
                c.Item().Row(r => {
                    r.ConstantItem(100).Text("Imię i Nazwisko:").Bold();
                    r.RelativeItem().Text($"{user.FirstName} {user.LastName}".ToUpper());
                });

                c.Item().PaddingTop(2).Row(r => {
                    r.ConstantItem(100).Text("PESEL:").Bold();
                    r.RelativeItem().Text(user.Pesel ?? "BRAK DANYCH");
                });

                if (!string.IsNullOrEmpty(sub.Street))
                {
                    c.Item().PaddingTop(2).Row(r => {
                        r.ConstantItem(100).Text("Adres:").Bold();
                        r.RelativeItem().Text($"ul. {sub.Street} {sub.HouseNumber}, {sub.ZipCode} {sub.City}");
                    });
                }
            });
            
            DrawSectionHeader(col, "3", "PRZEDMIOT UBEZPIECZENIA");
            col.Item().PaddingLeft(5).Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn();
                    columns.ConstantColumn(100);
                });

                table.Header(header =>
                {
                    header.Cell().Text("Nazwa Pakietu").Bold();
                    header.Cell().AlignRight().Text("Składka").Bold();
                });

                table.Cell().ColumnSpan(2).BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Height(5);

                table.Cell().PaddingTop(5).Text(sub.Package?.Name ?? "Pakiet");
                table.Cell().PaddingTop(5).AlignRight().Text(sub.PriceAtPurchase);
            });
            
            col.Item().PaddingLeft(5).PaddingTop(5)
                .Text($"Metoda płatności: {(sub.PaymentMethod ?? "Karta").ToUpper()}")
                .FontSize(9).FontColor(Colors.Grey.Darken2); 

            DrawSectionHeader(col, "4", "ZAKRES UBEZPIECZENIA");
            col.Item().PaddingLeft(5).Column(c =>
            {
                if (sub.Package?.Features != null && sub.Package.Features.Any())
                {
                    foreach (var feature in sub.Package.Features)
                    {
                        c.Item().PaddingBottom(4).Row(r =>
                        {
                            r.ConstantItem(15).PaddingLeft(5).PaddingTop(6).Element(e => 
                                e.Width(4).Height(4).Background(BlackColor).CornerRadius(2)
                            );
                            r.RelativeItem().Text(feature);
                        });
                    }
                }
                else
                {
                    c.Item().Text("Pełny zakres usług medycznych zgodnie z Regulaminem.");
                }
            });

            DrawSectionHeader(col, "5", "POSTANOWIENIA DODATKOWE");
            col.Item().PaddingLeft(5).Text(
                "Niniejszy certyfikat potwierdza zawarcie umowy ubezpieczenia zdrowotnego w systemie Medisure. " +
                "Ochrona świadczona jest przez Medisure Polska Sp. z o.o. zgodnie z Ogólnymi Warunkami Ubezpieczenia (OWU). " +
                "W przypadku nagłych zachorowań prosimy o kontakt z infolinią 24/7. " +
                "Dokument wygenerowany elektronicznie, nie wymaga podpisu ani pieczęci.")
                .FontSize(8).Justify();
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.Column(col =>
        {
            col.Item().LineHorizontal(1.5f).LineColor(PrimaryColor);
            col.Item().PaddingTop(5).Row(row =>
            {
                row.RelativeItem().Text($"Dokument wygenerowany: {DateTime.Now:dd.MM.yyyy, HH:mm:ss}")
                    .FontSize(8).FontColor(Colors.Grey.Medium);
                
                row.RelativeItem().AlignRight().Column(c =>
                {
                    c.Item().AlignRight().Text("Medisure Polska Sp. z o.o. | NIP: 2137004852")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                    c.Item().AlignRight().Text("ul. Grochowska 21, 61-001 Poznań")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                });
            });
        });
    }

    private void DrawSectionHeader(ColumnDescriptor col, string number, string title)
    {
        col.Item().PaddingTop(15).PaddingBottom(8).Row(row =>
        {
            row.ConstantItem(20)
                .Background(BlackColor)
                .Height(15)
                .AlignMiddle()
                .AlignCenter()
                .Text(number)
                .FontColor(Colors.White)
                .Bold()
                .FontSize(10);
            
            row.RelativeItem()
                .Background(GrayColor)
                .Height(15)
                .PaddingLeft(10)
                .AlignMiddle()
                .Text(title.ToUpper())
                .FontColor(BlackColor);
        });
    }
}