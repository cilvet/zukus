import { listCharacters, getCharacter, type ZukusCharacterListItem } from '../supabase/character-repository'
import type { ZukusActor } from '../documents/actor'

/**
 * Open dialog to link a Foundry actor with a Zukus cloud character.
 */
export async function openLinkCharacterDialog(actor: ZukusActor): Promise<void> {
  // Show loading state
  ui.notifications?.info('Loading characters from Zukus...')

  let characters: ZukusCharacterListItem[] = []

  try {
    characters = await listCharacters()
  } catch (error) {
    ui.notifications?.error(`Failed to load characters: ${(error as Error).message}`)
    return
  }

  if (characters.length === 0) {
    ui.notifications?.warn('No characters found in your Zukus account')
    return
  }

  // Format date for display
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Never'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Unknown'
    }
  }

  const content = `
    <div class="zukus-link-dialog">
      <p>Select a character to link with <strong>${actor.name}</strong>:</p>
      <div class="character-list">
        ${characters.map((char) => `
          <div class="character-option" data-character-id="${char.id}">
            <div class="character-info">
              <span class="character-name">${char.name}</span>
              <span class="character-build">${char.build || 'No class'}</span>
            </div>
            <div class="character-meta">
              <span class="character-modified">Last modified: ${formatDate(char.modified)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <p class="link-warning">
        <i class="fas fa-exclamation-triangle"></i>
        Linking will sync this actor with the cloud character. The cloud version will replace the local data.
      </p>
    </div>
  `

  let selectedId: string | null = null

  const dialog = new Dialog({
    title: 'Link to Zukus Character',
    content,
    buttons: {
      link: {
        icon: '<i class="fas fa-link"></i>',
        label: 'Link & Sync',
        callback: async () => {
          if (!selectedId) {
            ui.notifications?.warn('Please select a character')
            return
          }

          await linkCharacter(actor, selectedId)
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: 'Cancel',
      },
    },
    default: 'link',
    render: (html: JQuery) => {
      // Set up character selection
      html.find('.character-option').on('click', (event) => {
        const el = event.currentTarget
        const id = el.dataset.characterId

        // Remove selection from all
        html.find('.character-option').removeClass('selected')

        // Add selection to clicked
        $(el).addClass('selected')
        selectedId = id || null
      })
    },
  }, {
    width: 450,
    height: 500,
    classes: ['zukus-link-dialog-window'],
  })

  dialog.render(true)
}

/**
 * Link an actor to a Zukus cloud character.
 * Pulls the remote data to replace local data.
 */
async function linkCharacter(actor: ZukusActor, zukusCharacterId: string): Promise<void> {
  ui.notifications?.info('Linking character...')

  try {
    // Fetch the character data from Supabase
    const charDetail = await getCharacter(zukusCharacterId)

    if (!charDetail) {
      ui.notifications?.error('Character not found in Zukus')
      return
    }

    // Set the link ID
    await actor.setZukusCharacterId(zukusCharacterId)

    // Pull remote data to local (overwrite local with cloud data)
    await actor.setCharacterBaseData(charDetail.characterData)

    ui.notifications?.info(`Successfully linked to "${charDetail.characterData.name}"`)

    // Re-render any open sheets
    actor.sheet?.render(false)
  } catch (error) {
    ui.notifications?.error(`Failed to link: ${(error as Error).message}`)
  }
}

/**
 * Unlink an actor from its Zukus cloud character.
 */
export async function unlinkCharacter(actor: ZukusActor): Promise<void> {
  const confirmed = await Dialog.confirm({
    title: 'Unlink Character',
    content: '<p>Unlink this actor from Zukus? The local data will be preserved, but syncing will stop.</p>',
  })

  if (!confirmed) return

  try {
    await actor.setZukusCharacterId(null)
    ui.notifications?.info('Character unlinked from Zukus')
    actor.sheet?.render(false)
  } catch (error) {
    ui.notifications?.error(`Failed to unlink: ${(error as Error).message}`)
  }
}
