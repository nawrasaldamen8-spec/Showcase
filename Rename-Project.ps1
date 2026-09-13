[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, Position = 0, HelpMessage = "The new name for your project/solution (e.g., ECommerce)")]
    [ValidateNotNullOrEmpty()]
    [string]$NewName
)

$ErrorActionPreference = "Stop"

$OldName = "Architecture"
$RootDir = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 Renaming Template: $OldName -> $NewName" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Clean bin and obj folders to prevent file locks and stale builds
Write-Host "`n🧹 Cleaning bin and obj directories..." -ForegroundColor Yellow
Get-ChildItem -Path $RootDir -Include bin, obj -Recurse -Directory -Force -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

# 2. Text Replacement in Files
Write-Host "`n📝 Replacing namespaces and project references inside files..." -ForegroundColor Yellow
$targetExtensions = @("*.cs", "*.csproj", "*.slnx", "*.json", "*.http", "*.md", "*.props", "*.config")

$filesToProcess = Get-ChildItem -Path $RootDir -Recurse -File | Where-Object {
    $file = $_
    $matched = $false
    foreach ($ext in $targetExtensions) {
        if ($file.Name -like $ext) {
            $matched = $true
            break
        }
    }
    # Exclude git internal files and this script itself
    if ($file.FullName -like "*\.git\*" -or $file.FullName -eq $PSCommandPath) {
        $matched = $false
    }
    return $matched
}

foreach ($file in $filesToProcess) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
        if ($content.Contains($OldName)) {
            $newContent = $content.Replace($OldName, $NewName)
            [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
            Write-Host "  Updated content: $($file.Name)" -ForegroundColor Green
        }
    }
    catch {
        Write-Warning "Could not update text in $($file.FullName): $_"
    }
}

# 3. Rename Files containing $OldName
Write-Host "`n📄 Renaming files containing '$OldName'..." -ForegroundColor Yellow
$filesToRename = Get-ChildItem -Path $RootDir -Recurse -File | Where-Object {
    $_.Name -like "*$OldName*" -and $_.FullName -notlike "*\.git\*" -and $_.FullName -ne $PSCommandPath
}

foreach ($file in $filesToRename) {
    $newFileName = $file.Name.Replace($OldName, $NewName)
    $newFilePath = Join-Path $file.DirectoryName $newFileName
    Move-Item -Path $file.FullName -Destination $newFilePath -Force
    Write-Host "  Renamed file: $($file.Name) -> $newFileName" -ForegroundColor Green
}

# 4. Rename Directories containing $OldName (Deepest first)
Write-Host "`n📁 Renaming folders containing '$OldName'..." -ForegroundColor Yellow
$dirsToRename = Get-ChildItem -Path $RootDir -Recurse -Directory | Where-Object {
    $_.Name -like "*$OldName*" -and $_.FullName -notlike "*\.git\*"
} | Sort-Object { $_.FullName.Length } -Descending

foreach ($dir in $dirsToRename) {
    $newDirName = $dir.Name.Replace($OldName, $NewName)
    $newDirPath = Join-Path $dir.Parent.FullName $newDirName
    Move-Item -Path $dir.FullName -Destination $newDirPath -Force
    Write-Host "  Renamed directory: $($dir.Name) -> $newDirName" -ForegroundColor Green
}

# 5. Clean Template-Specific Files
Write-Host "`n🧹 Removing template-specific review files..." -ForegroundColor Yellow
$reviewFile = Join-Path $RootDir "REVIEW.md"
if (Test-Path $reviewFile) {
    Remove-Item -Path $reviewFile -Force
    Write-Host "  Deleted REVIEW.md" -ForegroundColor Green
}

Write-Host "`n🔨 Testing build with new name..." -ForegroundColor Yellow
$newSlnx = Join-Path $RootDir "$NewName.slnx"
if (Test-Path $newSlnx) {
    & dotnet build "$newSlnx"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 Build Succeeded! Project is ready to go." -ForegroundColor Cyan

        # Self-delete this script
        Write-Host "🗑️ Removing Rename-Project.ps1..." -ForegroundColor Yellow
        Remove-Item -Path $PSCommandPath -Force
        Write-Host "✅ All done! Happy coding." -ForegroundColor Green
    }
    else {
        Write-Warning "Build encountered an error. Please inspect the logs above. Rename script was NOT deleted so you can re-run if needed."
    }
}
else {
    Write-Host "✅ Renaming completed." -ForegroundColor Green
    Remove-Item -Path $PSCommandPath -Force
}
