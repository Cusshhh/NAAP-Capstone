Copy-Item "c:\Users\marcus\Herd\NAAP-Capstone\scratch\End-User Survey Questionnaire.docx" "c:\Users\marcus\Herd\NAAP-Capstone\scratch\temp_enduser.zip" -Force
Expand-Archive -Path "c:\Users\marcus\Herd\NAAP-Capstone\scratch\temp_enduser.zip" -DestinationPath "c:\Users\marcus\Herd\NAAP-Capstone\scratch\temp_enduser" -Force

[xml]$xml = Get-Content "c:\Users\marcus\Herd\NAAP-Capstone\scratch\temp_enduser\word\document.xml"
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$paragraphs = $xml.SelectNodes("//w:p", $ns)
$lines = @()
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns) | ForEach-Object { $_.InnerText }
    $line = $texts -join ""
    if ($line.Trim().Length -gt 0) {
        $lines += $line
    }
}
$lines | Out-File -FilePath "c:\Users\marcus\Herd\NAAP-Capstone\scratch\extracted_enduser_survey.txt" -Encoding utf8
Write-Output "Extracted $($lines.Count) lines."
