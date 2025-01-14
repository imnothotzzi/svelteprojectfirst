<!-- MainPage.svelte -->
<script>
  import { onMount } from 'svelte';

  const API_KEY = 'AIzaSyA8jsudsy9m8m6FxHhlWjsWoOakvY_-yZU';
  const categories = [
    "60대노인건강 관절",
    "60대노인건강 고혈압",
    "60대노인건강 감기",
    "60대노인건강 뇌졸중",
    "60대노인건강 당뇨"
  ];

  let videos = {};
  let selectedCategory = categories[0];
  let selectedVideo = null;
  let showModal = false;
  let selectedIndex = 0;
  let focusArea = 'category';
  let scrollContainer;

  async function fetchVideos(category) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(category)}&type=video&key=${API_KEY}`
      );
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching videos:', error);
      return [];
    }
  }

  function selectCategory(category) {
    selectedCategory = category;
    selectedIndex = 0;
    focusArea = 'video';
    if (!videos[category]) {
      fetchVideos(category).then(result => {
        videos[category] = result;
        videos = {...videos};
      });
    }
  }

  function openVideo(video) {
    selectedVideo = video;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedVideo = null;
  }

  function scrollToSelectedCard() {
    if (focusArea === 'video' && scrollContainer) {
      const selectedCard = scrollContainer.querySelector(`.video-card:nth-child(${selectedIndex + 1})`);
      if (selectedCard) {
        const containerWidth = scrollContainer.offsetWidth;
        const cardLeft = selectedCard.offsetLeft;
        const cardWidth = selectedCard.offsetWidth;
        
        // 선택된 카드가 컨테이너의 중앙에 오도록 스크롤
        const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
        scrollContainer.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  // 키보드 이벤트 처리
  function handleKeydown(event) {
    if (showModal) {
      if (event.key === 'Escape') closeModal();
      return;
    }

    const currentVideos = videos[selectedCategory] || [];
    const categoryIndex = categories.indexOf(selectedCategory);
    
    switch(event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (focusArea === 'video') {
          focusArea = 'category';
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (focusArea === 'category') {
          focusArea = 'video';
          scrollToSelectedCard();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (focusArea === 'category') {
          const nextCategoryIndex = (categoryIndex + 1) % categories.length;
          selectedCategory = categories[nextCategoryIndex];
          if (!videos[selectedCategory]) {
            fetchVideos(selectedCategory).then(result => {
              videos[selectedCategory] = result;
              videos = {...videos};
            });
          }
        } else {
          selectedIndex = (selectedIndex + 1) % currentVideos.length;
          scrollToSelectedCard();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (focusArea === 'category') {
          const prevCategoryIndex = categoryIndex === 0 ? categories.length - 1 : categoryIndex - 1;
          selectedCategory = categories[prevCategoryIndex];
          if (!videos[selectedCategory]) {
            fetchVideos(selectedCategory).then(result => {
              videos[selectedCategory] = result;
              videos = {...videos};
            });
          }
        } else {
          selectedIndex = selectedIndex === 0 ? currentVideos.length - 1 : selectedIndex - 1;
          scrollToSelectedCard();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (focusArea === 'video' && currentVideos[selectedIndex]) {
          openVideo(currentVideos[selectedIndex]);
        }
        break;
    }
  }

  onMount(async () => {
    videos[selectedCategory] = await fetchVideos(selectedCategory);
    videos = {...videos};
  });

  $: if (selectedIndex !== undefined && focusArea === 'video') {
    scrollToSelectedCard();
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="main-container">
  <header>
    <h1>맞춤 건강 정보</h1>
    <div class="category-buttons">
      {#each categories as category}
        <button 
          class="category-button" 
          class:selected={selectedCategory === category && focusArea === 'category'}
          on:click={() => selectCategory(category)}
        >
          {category.replace('60대노인건강 ', '')}
        </button>
      {/each}
    </div>
  </header>

  <section class="video-section">
    <div class="video-scroll" bind:this={scrollContainer}>
      <div class="video-container">
        {#if videos[selectedCategory]}
          {#each videos[selectedCategory] as video, index}
            <div 
              class="video-card" 
              class:selected={index === selectedIndex && focusArea === 'video'}
              on:click={() => openVideo(video)}
            >
              <div class="thumbnail-wrapper">
                <img 
                  src={video.snippet.thumbnails.high.url} 
                  alt={video.snippet.title}
                  class="thumbnail"
                />
                <div class="play-overlay">
                  <div class="play-button">▶</div>
                </div>
              </div>
              <div class="video-info">
                <h3 class="video-title">{video.snippet.title}</h3>
                <p class="channel-title">{video.snippet.channelTitle}</p>
              </div>
            </div>
          {/each}
        {:else}
          <div class="loading">영상을 불러오는 중입니다...</div>
        {/if}
      </div>
    </div>
  </section>
</div>

{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <button class="close-button" on:click={closeModal}>×</button>
      <div class="modal-video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/{selectedVideo.id.videoId}?autoplay=1"
          title={selectedVideo.snippet.title}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
{/if}

<style>
  /* 이전 스타일 유지 */
  .main-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    text-align: center;
    margin-bottom: 40px;
  }

  h1 {
    font-size: 2.5em;
    color: #333;
    margin-bottom: 30px;
  }

  .category-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
    flex-wrap: wrap;
  }

  .category-button {
    font-size: 1.2em;
    padding: 10px 20px;
    background-color: white;
    border: 2px solid #ff9900;
    color: #ff9900;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 25px;
  }

  .category-button.selected {
    background-color: #ff9900;
    color: white;
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .video-scroll {
    width: 100%;
    overflow-x: auto;
    padding: 20px 0;
    margin-right: -20px; /* 오른쪽 여백 제거 */
  }

  .video-container {
    display: flex;
    gap: 20px;
    padding: 0 10px;
    width: max-content; /* 컨테이너가 모든 카드를 수평으로 포함하도록 함 */
  }
  .video-card {
    flex: 0 0 500px;
    height: 550px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, outline 0.3s ease;
    cursor: pointer;
  }

  .video-card.selected {
    outline: 3px solid #ff9900;
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  }

  .thumbnail-wrapper {
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    overflow: hidden;
  }

  .thumbnail {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .video-card:hover .play-overlay,
  .video-card.selected .play-overlay {
    opacity: 1;
  }

  .play-button {
    font-size: 48px;
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .video-info {
    padding: 20px;
    height: calc(100% - 56.25% - 40px);
    overflow-y: auto;
  }

  .video-title {
    font-size: 30px;
    font-weight: 600;
    margin: 0 0 8px 0;
    line-height: 1.4;
    max-height: none;
    overflow: visible;
    white-space: normal;
  }

  .channel-title {
    font-size: 26px;
    color: #444;
    margin: 0;
    font-weight: 500;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    width: 90%;
    max-width: 1200px;
    position: relative;
  }

  .modal-video-wrapper {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
  }

  .modal-video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .close-button {
    position: absolute;
    top: -40px;
    right: -40px;
    font-size: 36px;
    color: white;
    background: none;
    border: none;
    cursor: pointer;
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }
</style>
