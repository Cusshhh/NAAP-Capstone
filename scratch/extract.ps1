$docxPath = "c:\Users\marcus\Herd\NAAP-Capstone\Captone Paper\CAPSTONE-MANUSCRIPT-CACACHO-ALARCIO-CHAPTER1_AND_2-UPDATED.docx"
$zipPath = "c:\Users\marcus\Herd\NAAP-Capstone\scratch\temp_paper.zip"
$destPath = "c:\Users\marcus\Herd\NAAP-Capstone\scratch\docx_extracted"
$outTxt = "c:\Users\marcus\Herd\NAAP-Capstone\scratch\manuscript_text.txt"

if (Test-Path $destPath) { Remove-Item -Recurse -Force $destPath }
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

Copy-Item -Path $docxPath -Destination $zipPath
Expand-Archive -Path $zipPath -DestinationPath $destPath

[xml]$xml = Get-Content "$destPath\word\document.xml" -Raw
$ns = New-Object System.Xml.XmlNamespaceManager -ArgumentList $xml.NameTable
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$pNodes = $xml.SelectNodes("//w:p", $ns)
$lines = @()

foreach ($p in $pNodes) {
    $tNodes = $p.SelectNodes(".//w:t", $ns)
    $textParts = @()
    foreach ($t in $tNodes) {
        $textParts += $t.InnerText
    }
    if ($textParts.Count -gt 0) {
        $lines += ($textParts -join "")
    } else {
        $lines += ""
    }
}

$lines | Out-File -FilePath $outTxt -Encoding utf8
Write-Host "Successfully extracted text! Total paragraphs:" $lines.Count
