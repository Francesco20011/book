local bookProp = nil

-- Export function for ox_inventory item usage
exports('grimorio_mago', function()
    TriggerEvent('gmm-books:client:OpenBook', 'grimorio_mago')
end)

-- Alternative direct function
function OpenGrimorio()
    TriggerEvent('gmm-books:client:OpenBook', 'grimorio_mago')
end

exports('OpenGrimorio', OpenGrimorio)

local function PlayAnimation(dict, name, duration)
    lib.requestAnimDict(dict)
    TaskPlayAnim(PlayerPedId(), dict, name, 1.0, -1.0, duration, 49, 1, false, false, false)
    RemoveAnimDict(dict)
end

local propOffsetsRotations = {
    book = { x = 0.15, y = 0.03, z = -0.065, rx = 0.0, ry = 180.0, rz = 90.0, boneIndex = 6286 },
    map = { x = 0.0, y = 0.0, z = 0.0, rx = 0.0, ry = 0.0, rz = 0.0, boneIndex = 28422 },
}

local function HandleProp(action, ped, ped_coords, bookName, prop)
    if action == 'add' then
        local propName = Config.Books[bookName]["prop"] == 'book' and "prop_novel_01" or "prop_tourist_map_01"
        local propOffset = propOffsetsRotations[Config.Books[bookName]["prop"]]
        local propRotation = propOffset.rx and vector3(propOffset.rx, propOffset.ry, propOffset.rz) or vector3(0.0, 0.0, 0.0)
        lib.requestModel(propName)
        bookProp = CreateObject(propName, ped_coords.x, ped_coords.y, ped_coords.z, true, true, true)
        AttachEntityToEntity(bookProp, ped, GetPedBoneIndex(ped, propOffset.boneIndex), propOffset.x, propOffset.y, propOffset.z, propRotation.x, propRotation.y, propRotation.z, true, true, false, true, 1, true)

        SetModelAsNoLongerNeeded(propName)
        PlayAnimation('cellphone@', 'cellphone_text_read_base', 10000)
    elseif action == 'remove' then
        ClearPedSecondaryTask(ped)
        Wait(1000)
        SetEntityAsMissionEntity(prop)
        DeleteObject(prop)
        bookProp = nil
    end
end

AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() == resourceName) then
        SetNuiFocus(false,false)
        SendNUIMessage({
            show = false
        })
        ClearPedSecondaryTask(PlayerPedId())
        if bookProp then
            SetEntityAsMissionEntity(bookProp)
            DeleteObject(bookProp)
        end
    end
end)

RegisterNetEvent('gmm-books:client:OpenBook', function(bookName)
    print("📖 [DEBUG] Evento ricevuto per aprire libro:", bookName)
    
    -- Debug: controlla se il config esiste
    if not Config.Books[bookName] then
        print("❌ [ERROR] Libro non trovato nel config:", bookName)
        return
    end
    
    print("✅ [DEBUG] Config libro trovato, pagine:", #Config.Books[bookName]["pages"])
    
    -- Semplifichiamo per ora, senza prop
    SetNuiFocus(true, true)
    
    local dataToSend = {
        show = true,
        book = bookName,
        pages = Config.Books[bookName]["pages"],
        size = Config.Books[bookName]["size"],
    }
    
    print("📤 [DEBUG] Invio dati a NUI")
    SendNUIMessage(dataToSend)
end)

RegisterNUICallback('escape', function(data, cb)
    print("🔄 [DEBUG] Chiusura libro richiesta")
    SetNuiFocus(false, false)
    SendNUIMessage({ show = false })
    cb('ok')
end)

-- Comando di test per aprire il grimorio direttamente
RegisterCommand('opengrimorio', function()
    print("🎮 [DEBUG] Comando opengrimorio eseguito")
    TriggerEvent('gmm-books:client:OpenBook', 'grimorio_mago')
end)