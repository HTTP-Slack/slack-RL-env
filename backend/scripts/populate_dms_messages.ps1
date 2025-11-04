# Script to create synthetic users, conversations and messages via backend API
$ErrorActionPreference = 'Stop'
$api = 'http://localhost:5000/api'

# Sign in as test user
$testCred = @{ email = 'test@hotmail.com'; password = 'testest1' } | ConvertTo-Json
$signin = Invoke-RestMethod -Uri "$api/auth/signin" -Method Post -Body $testCred -ContentType 'application/json'
$testToken = $signin.token
Write-Output "Test token acquired"

$orgId = '6909c7fa9ae7ebbe11a01414'
$created = @()

for ($i = 1; $i -le 5; $i++) {
    $suffix = [guid]::NewGuid().ToString().Substring(0,6)
    $username = "synthetic_user_${i}_$suffix"
    $email = "$username@example.test"
    $password = 'Testpass1'

    $body = @{ username = $username; email = $email; password = $password } | ConvertTo-Json
    Write-Output "Registering $username $email"
    $reg = Invoke-RestMethod -Uri "$api/auth/register" -Method Post -Body $body -ContentType 'application/json'
    $userToken = $reg.token
    $userId = $reg.data._id

    # Add to organisation
    $addBody = @{ emails = @($email) } | ConvertTo-Json
    Invoke-RestMethod -Uri "$api/organisation/$orgId/coworkers" -Method Patch -Body $addBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $testToken" }
    Write-Output "Added $username to organisation"

    # Create conversation (1:1)
    $convBody = @{ otherUserId = $userId } | ConvertTo-Json
    $conv = Invoke-RestMethod -Uri "$api/organisation/$orgId/conversation" -Method Post -Body $convBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $testToken" }
    $convId = $conv.data._id
    Write-Output "Created conversation $convId with $username"

    # Post 16 messages alternating between the two users
    for ($m = 1; $m -le 16; $m++) {
        if ($m % 2 -eq 0) { $senderToken = $testToken } else { $senderToken = $userToken }
        $content = "Message $m in convo with $username - sample text"
        $msgBody = @{ content = $content; organisation = $orgId; conversationId = $convId } | ConvertTo-Json
        $msg = Invoke-RestMethod -Uri "$api/message" -Method Post -Body $msgBody -ContentType 'application/json' -Headers @{ Authorization = "Bearer $senderToken" }
        if ($m % 4 -eq 0) { Write-Output "  Posted message $m" }
    }

    $created += @{ username = $username; email = $email; id = $userId; token = $userToken; conversation = $convId }
}

Write-Output "\nCreated users/conversations:"
$created | ConvertTo-Json -Depth 4

# Verify message count for first conversation
$sampleConv = $created[0].conversation
$verifyUrl = $api + '/message?conversationId=' + $sampleConv + '&organisation=' + $orgId
$resp = Invoke-RestMethod -Uri $verifyUrl -Method Get -Headers @{ Authorization = "Bearer $testToken" }
Write-Output "\nSample conversation message count: $($resp.data.Count)"
