Attribute VB_Name = "YellowJake"
' ================================================================
'  YELLOW JAKE - boutons et facturation automatique (Excel Windows)
'  Installation (une seule fois) :
'   1. Ouvre Yellow_Jake_Compta.xlsx dans Excel, puis Alt + F11
'   2. Fichier > Importer un fichier... > choisis YellowJake_Macros.bas
'   3. Ferme l'éditeur, puis Alt + F8 > InstallerBoutons > Exécuter
'   4. Fichier > Enregistrer sous > "Classeur Excel (prenant en charge les macros) (*.xlsm)"
'  Ensuite : ouvre toujours le .xlsm et clique sur "Activer le contenu".
' ================================================================
Option Explicit

Private Const PFX As String = "yj_"
Private Const H0 As Long = 7        ' première ligne de l'historique / archive
Private Const HMAX As Long = 506    ' dernière ligne de l'historique
Private Const AMAX As Long = 2006   ' dernière ligne de l'archive

' ---------- Installation des boutons ----------
Public Sub InstallerBoutons()
    Dim ws As Worksheet, c As Range, n As Long
    Application.ScreenUpdating = False
    For Each ws In ThisWorkbook.Worksheets
        SupprimerBoutons ws
        For Each c In ws.Range("A1:N40").Cells
            If c.HasFormula Then
                If InStr(1, c.Formula, "HYPERLINK(""#", vbTextCompare) > 0 Then
                    If c.Address = c.MergeArea.Cells(1, 1).Address Then
                        n = n + 1
                        If InStr(1, c.Formula, """FACTURER""", vbTextCompare) > 0 Then
                            AjouterBouton ws, c.MergeArea, "FACTURER", "Facturer", "", 28, False
                        Else
                            AjouterBouton ws, c.MergeArea, c.Text, "Naviguer", CibleLien(c.Formula), _
                                IIf(ws.Name = "Accueil", 14, 10), (ws.Name <> "Accueil")
                        End If
                    End If
                End If
            End If
        Next c
    Next ws
    With ThisWorkbook.Worksheets("Vente")
        AjouterBouton ThisWorkbook.Worksheets("Vente"), .Range("I19").MergeArea, "EFFACER", "Effacer", "", 28, False
    End With
    With ThisWorkbook.Worksheets("Historique Semaine")
        AjouterBouton ThisWorkbook.Worksheets("Historique Semaine"), .Range("I3:K3"), "ARCHIVER LA SEMAINE", "ArchiverSemaine", "", 10, True
    End With
    Application.ScreenUpdating = True
    ThisWorkbook.Worksheets("Accueil").Activate
    MsgBox n + 2 & " boutons installés." & vbCrLf & vbCrLf & _
        "Enregistre maintenant le fichier au format .xlsm" & vbCrLf & _
        "(Classeur Excel prenant en charge les macros).", vbInformation, "Yellow Jake"
End Sub

Private Sub SupprimerBoutons(ws As Worksheet)
    Dim i As Long
    For i = ws.Shapes.Count To 1 Step -1
        If Left(ws.Shapes(i).Name, Len(PFX)) = PFX Then ws.Shapes(i).Delete
    Next i
End Sub

Private Function CibleLien(ByVal f As String) As String
    Dim s As String
    s = Mid(f, InStr(f, "#") + 1)
    s = Left(s, InStr(s, "!") - 1)
    CibleLien = Replace(s, "'", "")
End Function

Private Sub AjouterBouton(ws As Worksheet, rng As Range, ByVal txt As String, ByVal macro As String, _
                         ByVal cible As String, ByVal taille As Single, ByVal sombre As Boolean)
    Dim shp As Shape
    Set shp = ws.Shapes.AddShape(msoShapeRoundedRectangle, rng.Left + 2, rng.Top + 2, rng.Width - 4, rng.Height - 4)
    shp.Name = PFX & macro & "_" & ws.Shapes.Count
    shp.AlternativeText = cible
    If sombre Then
        shp.Fill.ForeColor.RGB = RGB(0, 0, 0)
    Else
        shp.Fill.ForeColor.RGB = RGB(255, 255, 255)
    End If
    shp.Line.ForeColor.RGB = RGB(0, 0, 0)
    shp.Line.Weight = 2.25
    With shp.TextFrame2
        .VerticalAnchor = msoAnchorMiddle
        .MarginLeft = 2: .MarginRight = 2
        .TextRange.Text = txt
        .TextRange.ParagraphFormat.Alignment = msoAlignCenter
        .TextRange.Font.Name = "Arial"
        .TextRange.Font.Size = taille
        .TextRange.Font.Bold = msoTrue
        If sombre Then
            .TextRange.Font.Fill.ForeColor.RGB = RGB(241, 194, 50)
        Else
            .TextRange.Font.Fill.ForeColor.RGB = RGB(0, 0, 0)
        End If
    End With
    shp.OnAction = macro
End Sub

' ---------- Navigation (un seul clic) ----------
Public Sub Naviguer()
    Dim cible As String
    cible = ActiveSheet.Shapes(Application.Caller).AlternativeText
    ThisWorkbook.Worksheets(cible).Activate
    ActiveWindow.ScrollRow = 1
    ActiveWindow.ScrollColumn = 1
End Sub

' ---------- Facturation ----------
Public Sub Facturer()
    Dim v As Worksheet, h As Worksheet, r As Long, qte As Double
    Set v = ThisWorkbook.Worksheets("Vente")
    Set h = ThisWorkbook.Worksheets("Historique Semaine")

    If Trim(CStr(v.Range("E7").Value)) = "" Then MsgBox "Choisis le nom du vendeur.", vbExclamation, "Yellow Jake": Exit Sub
    If Trim(CStr(v.Range("G7").Value)) = "" Then MsgBox "Choisis le produit.", vbExclamation, "Yellow Jake": Exit Sub
    If Not IsNumeric(v.Range("C12").Value) Or Trim(CStr(v.Range("C12").Value)) = "" Then
        MsgBox "Indique la quantité.", vbExclamation, "Yellow Jake": Exit Sub
    End If
    qte = v.Range("C12").Value
    If qte <= 0 Then MsgBox "La quantité doit être supérieure à 0.", vbExclamation, "Yellow Jake": Exit Sub
    If Not IsDate(v.Range("I7").Value) Then MsgBox "Date de vente invalide.", vbExclamation, "Yellow Jake": Exit Sub
    If IsNumeric(v.Range("K17").Value) And Trim(CStr(v.Range("K17").Value)) <> "" Then
        If qte > v.Range("K17").Value Then
            If MsgBox("Stock insuffisant : " & v.Range("K17").Value & " " & v.Range("G7").Value & " disponible(s)." & vbCrLf & _
                      "Facturer quand même ?", vbYesNo + vbExclamation, "Yellow Jake") = vbNo Then Exit Sub
        End If
    End If

    r = H0
    Do While r <= HMAX
        If Trim(CStr(h.Cells(r, "F").Value)) = "" Then Exit Do
        r = r + 1
    Loop
    If r > HMAX Then MsgBox "L'historique est plein : archive la semaine.", vbExclamation, "Yellow Jake": Exit Sub

    h.Cells(r, "C").Value = CDate(v.Range("I7").Value)
    h.Cells(r, "D").Value = v.Range("E7").Value
    h.Cells(r, "E").Value = v.Range("E12").Value
    h.Cells(r, "F").Value = v.Range("G7").Value
    h.Cells(r, "H").Value = qte
    Application.Calculate

    MsgBox "Vente n° " & h.Cells(r, "B").Value & " enregistrée" & vbCrLf & vbCrLf & _
        qte & " x " & h.Cells(r, "F").Value & "  (vendeur : " & h.Cells(r, "D").Value & ")" & vbCrLf & _
        "Prix de vente : " & Format(h.Cells(r, "I").Value, "#,##0.00") & " $" & vbCrLf & _
        "Bénéfice : " & Format(h.Cells(r, "J").Value, "#,##0.00") & " $" & vbCrLf & _
        "Prime : " & Format(h.Cells(r, "L").Value, "#,##0.00") & " $", vbInformation, "Yellow Jake"
    ViderFormulaire
End Sub

Public Sub Effacer()
    ViderFormulaire
End Sub

Private Sub ViderFormulaire()
    With ThisWorkbook.Worksheets("Vente")
        .Range("E7").ClearContents
        .Range("G7").ClearContents
        .Range("C12").ClearContents
        .Range("E12").ClearContents
        .Range("I7").Formula = "=TODAY()"
    End With
End Sub

' ---------- Archivage de fin de semaine ----------
Public Sub ArchiverSemaine()
    Dim h As Worksheet, a As Worksheet, r As Long, ra As Long, n As Long
    Set h = ThisWorkbook.Worksheets("Historique Semaine")
    Set a = ThisWorkbook.Worksheets("Archive")
    For r = H0 To HMAX
        If Trim(CStr(h.Cells(r, "F").Value)) <> "" Then n = n + 1
    Next r
    If n = 0 Then MsgBox "Aucune vente à archiver.", vbInformation, "Yellow Jake": Exit Sub
    If MsgBox(n & " vente(s) vont être copiées dans l'Archive, puis l'historique sera vidé." & vbCrLf & _
              "Continuer ?", vbYesNo + vbQuestion, "Yellow Jake") = vbNo Then Exit Sub
    ra = H0
    Do While ra <= AMAX
        If Trim(CStr(a.Cells(ra, "F").Value)) = "" Then Exit Do
        ra = ra + 1
    Loop
    If ra + n - 1 > AMAX Then MsgBox "L'archive est pleine.", vbExclamation, "Yellow Jake": Exit Sub
    For r = H0 To HMAX
        If Trim(CStr(h.Cells(r, "F").Value)) <> "" Then
            a.Range(a.Cells(ra, "C"), a.Cells(ra, "L")).Value = h.Range(h.Cells(r, "C"), h.Cells(r, "L")).Value
            ra = ra + 1
        End If
    Next r
    h.Range(h.Cells(H0, "C"), h.Cells(HMAX, "F")).ClearContents
    h.Range(h.Cells(H0, "H"), h.Cells(HMAX, "H")).ClearContents
    MsgBox n & " vente(s) archivée(s). Nouvelle semaine prête.", vbInformation, "Yellow Jake"
End Sub
