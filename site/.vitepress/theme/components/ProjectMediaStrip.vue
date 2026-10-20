<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { ref, useId, watch } from 'vue'
import type { ProjectMedia } from '../../../projects.source'

const props = withDefaults(
  defineProps<{
    media: ProjectMedia[]
    variant?: 'flagship' | 'strip'
    eager?: boolean
  }>(),
  { variant: 'strip', eager: false },
)

const active = ref(0)
const mediaId = useId()
watch(() => props.media, () => {
  active.value = 0
})

function selectMedia(index: number, event?: KeyboardEvent) {
  if (!props.media.length) return
  active.value = (index + props.media.length) % props.media.length
  if (event) {
    const group = (event.currentTarget as HTMLElement).parentElement
    const button = group?.children[active.value] as HTMLButtonElement | undefined
    button?.focus()
  }
}
</script>

<template>
  <div v-if="media.length" class="vie-media-strip" :class="'is-' + variant" aria-label="产品截图">
    <div class="vie-media-stage">
      <figure
        v-for="(m, i) in media"
        v-show="active === i"
        :id="mediaId + '-media-' + i"
        :key="m.src"
        class="vie-media"
      >
        <a
          class="vie-media__link"
          :href="m.src"
          :aria-label="'查看完整图片：' + m.caption"
          target="_blank"
          rel="noopener"
        >
          <img
            :src="m.src"
            :alt="m.alt"
            :width="m.width"
            :height="m.height"
            :loading="eager && i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="eager && i === 0 ? 'high' : undefined"
            decoding="async"
          />
        </a>
        <figcaption>
          <span>{{ m.caption }}</span>
          <a :href="m.src" target="_blank" rel="noopener" :aria-label="'查看原图：' + m.caption">原图 ↗</a>
        </figcaption>
      </figure>
    </div>
    <div v-if="media.length > 1" class="vie-media-navigation">
      <p role="status" aria-live="polite">{{ active + 1 }} <span>/ {{ media.length }} 张产品截图</span></p>
      <div class="vie-media-navigation__arrows">
        <button type="button" aria-label="上一张产品截图" @click="selectMedia(active - 1)"><ChevronLeft :size="18" aria-hidden="true" /></button>
        <button type="button" aria-label="下一张产品截图" @click="selectMedia(active + 1)"><ChevronRight :size="18" aria-hidden="true" /></button>
      </div>
    </div>
    <div v-if="media.length > 1" class="vie-media-select" role="group" aria-label="选择产品截图">
      <button
        v-for="(m, i) in media"
        :key="m.src"
        type="button"
        :aria-label="m.caption"
        :aria-pressed="active === i"
        :aria-controls="mediaId + '-media-' + i"
        :tabindex="active === i ? 0 : -1"
        @click="selectMedia(i)"
        @keydown.right.prevent="selectMedia(i + 1, $event)"
        @keydown.left.prevent="selectMedia(i - 1, $event)"
        @keydown.home.prevent="selectMedia(0, $event)"
        @keydown.end.prevent="selectMedia(media.length - 1, $event)"
      >
        <img :src="m.src" alt="" width="120" height="76" loading="lazy" decoding="async" />
        <span>{{ m.caption.split(' · ')[0] }}</span>
      </button>
    </div>
  </div>
</template>
