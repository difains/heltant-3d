/**
 * Dragon Raja: Heltant 3D - Lore, Landmark Interactions & Game Systems
 * Handles dialogue modal with original novel quotes, OPG toggle, and time-of-day switcher.
 */
import { sound } from './audio.js';

export class LoreManager {
  constructor(controller, lightingManager, avatar) {
    this.controller = controller;
    this.lighting = lightingManager;
    this.avatar = avatar;

    this.opgActive = false;
    this.activeLandmark = null;
    this.isModalOpen = false;

    this.landmarks = [
      {
        id: 'central_well',
        name: '마을 중앙 광장과 석조 우물',
        tag: '영지의 심장',
        pos: { x: 0, z: 0 },
        radius: 4.5,
        quote: '"인간은 단수가 아니다. 우리는 복수다."',
        desc: '마을 사람들이 시원한 두레박 물을 긷고 담소를 나누는 헬턴트의 중심 광장입니다. 낡은 이정표는 바이서스 수도 임펠로 향하는 가도와 서쪽 숲, 영주 저택을 가리키고 있습니다. 모든 모험과 여정이 시작되는 출발점입니다.',
        meta: '헬턴트 영지민, 지나가는 여행자'
      },
      {
        id: 'hooch_workshop',
        name: '후치의 집 & 초 공방',
        tag: '초장이의 아들',
        pos: { x: 18, z: -8 },
        radius: 5.5,
        quote: '"내 이름은 후치 네드발. 열일곱 살이다. 직업은 초장이의 아들."',
        desc: '헬턴트 영지의 작은 초 공방입니다. 아버지가 끓이던 구수한 쇠기름과 밀랍 냄새가 배어있습니다. 벽면에는 완성된 양초들이 가지런히 걸려 있으며, 소년 후치가 언젠가 드넓은 세상을 동경하던 유년기의 추억이 깃든 곳입니다.',
        meta: '후치 네드발, 초장이 아버지 네드발'
      },
      {
        id: 'karl_manor',
        name: '칼 헬턴트의 서재 / 영주 저택',
        tag: '현명한 조언자',
        pos: { x: 0, z: -30 },
        radius: 6.5,
        quote: '"용과 인간의 차이가 무엇인지 아는가, 후치? 인간은 스스로를 변화시키지만, 용은 세계를 자신에게 맞춘다네."',
        desc: '영주 헬턴트 자작의 이복동생이자 바이서스 최고의 석학 칼 헬턴트의 서재입니다. 수천 권의 역사서와 박물학 서적, 천문 기구들이 빼곡합니다. 서쪽 숲 아무르타트의 위협 속에서도 늘 침착하게 지혜를 내어놓는 영지의 두뇌입니다.',
        meta: '칼 헬턴트, 헬턴트 자작'
      },
      {
        id: 'heltant_tavern',
        name: '헬턴트 선술집 (타이번의 주점)',
        tag: '운명적인 만남',
        pos: { x: -20, z: 15 },
        radius: 6.0,
        quote: '"초장이 꼬마야, 이 장갑을 네게 주마. 그 대신 재미있는 노래 한 곡 불러주겠니?"',
        desc: '방랑자와 용병, 영지민들이 맥주잔을 부딪치며 피로를 씻는 헬턴트 선술집입니다. 훗날 바이서스 왕국을 뒤흔들게 되는 전설적인 맹인 마법사 타이번이 찾아와 후치에게 마법의 보물 "오거 파워 건틀릿(OPG)"을 건네준 역사적인 장소입니다.',
        meta: '맹인 마법사 타이번, 선술집 주인'
      },
      {
        id: 'sanson_smithy',
        name: '샌슨의 경비대 막사 & 대장간',
        tag: '헬턴트의 방패',
        pos: { x: 14, z: 20 },
        radius: 6.0,
        quote: '"트롤 따위는 내 검 한 자루면 충분해! 후치, 네 녀석도 어서 검술 연습이나 게을리하지 마라!"',
        desc: '우직하고 용맹한 경비조장 샌슨 퍼시발과 병사들이 훈련하는 연무장이자 대장간입니다. 모루 위에서 붉게 달아오른 쇳덩이를 두드리는 소리가 끊이지 않으며, 영지를 위협하는 몬스터들을 격퇴하기 위한 무기들이 가득합니다.',
        meta: '샌슨 퍼시발, 대장장이, 영지 경비대원'
      },
      {
        id: 'west_watchtower',
        name: '서쪽 감시 망루 & 방책 성벽',
        tag: '석양의 감시자',
        pos: { x: -36, z: -8 },
        radius: 6.5,
        quote: '"저 붉게 타오르는 서쪽 숲... 석양의 감시자 아무르타트가 똬리를 틀고 있는 곳이지."',
        desc: '헬턴트 영지의 서쪽 경계에 우뚝 솟은 거대한 목조 망루입니다. 높이 솟은 감시탑 너머로 불길하게 타오르는 붉은 석양과 침엽수림이 펼쳐집니다. 그 숲의 주인인 블랙 드래곤 아무르타트를 밤낮으로 감시하는 요충지입니다.',
        meta: '보초병들, 블랙 드래곤 아무르타트'
      },
      {
        id: 'watermill',
        name: '헬턴트 물레방아와 시냇물',
        tag: '고요한 일상',
        pos: { x: 30, z: 8 },
        radius: 6.0,
        quote: '"흐르는 강물처럼 시간은 멈추지 않고, 우리들의 이야기도 끝없이 흘러간다."',
        desc: '영지 동쪽을 가로지르는 맑은 시냇물 위에 지어진 운치 있는 물레방앗간입니다. 나무 수차가 삐걱거리며 곡식을 빻는 소리가 영지의 고요한 평화를 노래하듯 울려 퍼집니다.',
        meta: '방앗간 지기'
      }
    ];

    this.initUI();
    this.initKeyEvents();
  }

  initUI() {
    this.domPrompt = document.getElementById('interaction-prompt');
    this.domPromptTitle = document.getElementById('prompt-target-name');
    this.domModal = document.getElementById('dialogue-modal');
    this.domModalTag = document.getElementById('modal-tag');
    this.domModalTitle = document.getElementById('modal-title');
    this.domModalQuote = document.getElementById('modal-quote');
    this.domModalDesc = document.getElementById('modal-desc');
    this.domModalMeta = document.getElementById('modal-meta');
    this.domLocationText = document.getElementById('current-location-text');
    this.domOpgStatus = document.getElementById('opg-status-text');
    this.domOpgVignette = document.getElementById('opg-vignette');
    this.domTodLabel = document.getElementById('tod-mode-label');

    // Modal Close buttons
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-confirm-btn')?.addEventListener('click', () => this.closeModal());
    this.domPrompt?.addEventListener('click', () => this.interact());
  }

  initKeyEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        if (this.isModalOpen) {
          this.closeModal();
        } else if (this.activeLandmark) {
          this.interact();
        }
      } else if (e.code === 'Escape' && this.isModalOpen) {
        this.closeModal();
      } else if (e.code === 'KeyG') {
        this.toggleOpg();
      } else if (e.code === 'KeyT') {
        this.cycleTimeOfDay();
      } else if (e.code === 'KeyM') {
        const isMuted = sound.toggleMute();
        console.log('Audio muted:', isMuted);
      }
    });
  }

  toggleOpg() {
    this.opgActive = !this.opgActive;
    sound.playOpgHum(this.opgActive);

    if (this.domOpgStatus) {
      this.domOpgStatus.textContent = this.opgActive ? '[ON]' : '[OFF]';
      this.domOpgStatus.className = this.opgActive ? 'status-on' : 'status-off';
    }

    if (this.domOpgVignette) {
      this.domOpgVignette.classList.toggle('hidden', !this.opgActive);
    }

    this.avatar.setOpgActive(this.opgActive);
  }

  cycleTimeOfDay() {
    const nextMode = this.lighting.cycleMode();
    if (this.domTodLabel) {
      this.domTodLabel.textContent = this.lighting.getModeName();
    }
  }

  interact() {
    if (!this.activeLandmark) return;
    this.openModal(this.activeLandmark);
  }

  openModal(lm) {
    this.isModalOpen = true;
    sound.playInteractionChime();

    this.domModalTag.textContent = lm.tag;
    this.domModalTitle.textContent = lm.name;
    this.domModalQuote.textContent = lm.quote;
    this.domModalDesc.textContent = lm.desc;
    this.domModalMeta.innerHTML = `<span class="meta-label">관련 인물:</span> ${lm.meta}`;

    this.domModal.classList.remove('hidden');
  }

  closeModal() {
    this.isModalOpen = false;
    this.domModal.classList.add('hidden');
  }

  update() {
    const pPos = this.controller.getPosition();

    let nearest = null;
    let minDist = Infinity;

    for (let i = 0; i < this.landmarks.length; i++) {
      const lm = this.landmarks[i];
      const dist = Math.hypot(pPos.x - lm.pos.x, pPos.z - lm.pos.z);
      if (dist < lm.radius && dist < minDist) {
        minDist = dist;
        nearest = lm;
      }
    }

    if (nearest !== this.activeLandmark) {
      this.activeLandmark = nearest;
      if (nearest) {
        this.domPromptTitle.textContent = nearest.name;
        this.domPrompt.classList.remove('hidden');
        if (this.domLocationText) {
          this.domLocationText.textContent = `현재 위치: ${nearest.name}`;
        }
      } else {
        this.domPrompt.classList.add('hidden');
        if (this.domLocationText) {
          this.domLocationText.textContent = '현재 위치: 헬턴트 영지 안쪽 길';
        }
      }
    }
  }
}
