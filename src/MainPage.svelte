<script>
  import { onMount } from "svelte";

  const API_KEY = "AIzaSyA8jsudsy9m8m6FxHhlWjsWoOakvY_-yZU";

  const categories = [
    { name: "60대노인건강 수면", image: "sleepingbutton.png", displayName: "수면" },
    { name: "60대노인건강 스트레칭", image: "stretchbutton.png", displayName: "스트레칭" },
    { name: "60대노인건강 비만", image: "obesitybutton.png", displayName: "비만" },
    { name: "60대노인건강 스트레스", image: "stressbutton.png", displayName: "스트레스" },
    { name: "60대노인건강 간", image: "liverbutton.png", displayName: "간" },
    { name: "60대노인건강 관절", image: "jointbutton.png", displayName: "관절" },
    { name: "60대노인건강 당뇨", image: "diabetesbutton.png", displayName: "당뇨" },
    { name: "60대노인건강 심혈관", image: "heartbloodbutton.png", displayName: "심혈관" },
    { name: "60대노인건강 정기검진", image: "inspectionbutton.png", displayName: "정기검진" },
    { name: "60대노인건강 폐", image: "lungbutton.png", displayName: "폐" },
  ];


  let videos = {};
  let pageTokens = {};
  let selectedCategory = categories[0].name; // 문자열로 설정
  let selectedVideo = null;
  let showModal = false;
  let selectedIndex = 0;
  let focusArea = 'category';
  let scrollContainer;
  let isLoadingMore = false;
  let randomCategories = [];
  let showAllCategoriesModal = false;
  let remainingCategories = [];

  async function fetchVideos(categoryName, pageToken = '') {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(categoryName)}&type=video&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data.items || !data.items.length) throw new Error('No video data found');
        pageTokens[categoryName] = data.nextPageToken || null;
        return data.items;
      } catch (error) {
        console.error('Error fetching videos:', error.message);
        alert('비디오를 불러오는 중 문제가 발생했습니다.');
        return [];
      }
    }

  function openFullscreenVideo(video) {
    if (!video || !video.id || !video.id.videoId) {
      console.error('Invalid video data:', video);
      alert('비디오 데이터를 불러오는 데 문제가 발생했습니다.');
      return;
    }
    const videoUrl = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&origin=https://your-domain.com`;
    const iframe = document.createElement('iframe');
    iframe.src = videoUrl;
    iframe.allowFullscreen = true;
    iframe.style.width = '100%';
    iframe.style.height = '100%';

    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.style.position = 'fixed';
    fullscreenContainer.style.top = '0';
    fullscreenContainer.style.left = '0';
    fullscreenContainer.style.width = '100vw';
    fullscreenContainer.style.height = '100vh';
    fullscreenContainer.style.backgroundColor = 'black';
    fullscreenContainer.style.zIndex = '9999';
    fullscreenContainer.appendChild(iframe);

    document.body.appendChild(fullscreenContainer);

    // ESC 키 처리
    function handleEscape(event) {
      if (event.key === 'Escape') {
        document.body.removeChild(fullscreenContainer); // 전체 화면 종료
        window.removeEventListener('keydown', handleEscape); // 이벤트 리스너 제거
      }
    }

    window.addEventListener('keydown', handleEscape); // ESC 키 이벤트 리스너 추가

    // 클릭 시 종료
    fullscreenContainer.addEventListener('click', () => {
      document.body.removeChild(fullscreenContainer); // 전체 화면 종료
      window.removeEventListener('keydown', handleEscape); // 이벤트 리스너 제거
    });
  }




  async function loadMoreVideos() {
    if (isLoadingMore || !pageTokens[selectedCategory]) return;
    
    isLoadingMore = true;
    const newVideos = await fetchVideos(selectedCategory, pageTokens[selectedCategory]);
    if (newVideos.length > 0) {
      videos[selectedCategory] = [...videos[selectedCategory], ...newVideos];
      videos = {...videos};
    }
    isLoadingMore = false;
  }

  function selectCategory(categoryName) {
    selectedCategory = categoryName;
    selectedIndex = 0;
    focusArea = 'video';

    if (scrollContainer) {
      scrollContainer.scrollLeft = 0;
    }

    if (!videos[selectedCategory]) {
      fetchVideos(selectedCategory).then((result) => {
        videos[selectedCategory] = result;
        videos = { ...videos }; // Svelte 반응성을 위해 새 객체 생성

        if (result.length > 0) {
          selectedIndex = 0; // 첫 번째 비디오 선택
        }
      });
    }
  }



  function addCategory(category) {
  // 중복 방지: 이미 randomCategories에 있으면 아무 동작도 하지 않음
  if (randomCategories.find(cat => cat.name === category.name)) {
    console.log('Category already exists:', category.name);
    return;
  }

  // 카테고리 추가
  randomCategories = [...randomCategories, category];

  // 모달 닫기
  closeAllCategoriesModal();
  }



  function getRandomCategories() {
  const shuffled = [...categories].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
  }


  function openVideo(video) {
    if (!video || !video.id || !video.id.videoId) {
      console.error('Invalid video data:', video);
      alert('비디오 데이터를 불러오는 데 문제가 발생했습니다.');
      return;
    }

    selectedVideo = { ...video };
    showModal = true;
    showAllCategoriesModal = false; // 다른 Modal 비활성화
    focusArea = 'video'; // 포커스를 비디오로 설정
  }




  function closeModal() {
    showModal = false;
    selectedVideo = null;
  }

  function closeAllCategoriesModal() {
    showAllCategoriesModal = false;
    if (showModal) closeModal();
  }


  function scrollToSelectedCard() {
    if (focusArea === 'video' && scrollContainer) {
        const selectedCard = scrollContainer.querySelector(`.video-card:nth-child(${selectedIndex + 1})`);
        if (selectedCard) {
            const containerWidth = scrollContainer.offsetWidth;
            const cardLeft = selectedCard.offsetLeft;
            const cardWidth = selectedCard.offsetWidth;

            const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
            scrollContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            });
        }
    }
  }
  function openAllCategoriesModal() {
    remainingCategories = categories.filter(
      (category) => !randomCategories.includes(category)
    );
    showAllCategoriesModal = true;
    showModal = false; // 비디오 모달 비활성화
  }

  function handleKeydown(event) {
    const currentCategoryIndex = randomCategories.findIndex((cat) => cat.name === selectedCategory);
    const currentVideos = videos[selectedCategory] || [];

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (focusArea === 'category') {
          if (currentCategoryIndex === randomCategories.length - 1) {
            focusArea = 'addCategory';
          } else {
            const nextIndex = (currentCategoryIndex + 1) % randomCategories.length;
            selectCategory(randomCategories[nextIndex].name);
          }
        } else if (focusArea === 'video') {
          if (selectedIndex === currentVideos.length - 1) {
            focusArea = 'loadMore';
            selectedIndex++;
          } else {
            selectedIndex = (selectedIndex + 1) % currentVideos.length;
            scrollToSelectedCard();
          }
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (focusArea === 'addCategory') {
          focusArea = 'category';
          selectCategory(randomCategories[randomCategories.length - 1].name);
        } else if (focusArea === 'category') {
          const prevIndex = (currentCategoryIndex - 1 + randomCategories.length) % randomCategories.length;
          selectCategory(randomCategories[prevIndex].name);
        } else if (focusArea === 'loadMore') {
          focusArea = 'video';
          selectedIndex = currentVideos.length - 1;
          scrollToSelectedCard();
        } else if (focusArea === 'video') {
          selectedIndex = (selectedIndex - 1 + currentVideos.length) % currentVideos.length;
          scrollToSelectedCard();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (focusArea === 'category' && showAllCategoriesModal) {
          focusArea = 'modalCategory';
          selectedIndex = 0;
        } else if (focusArea === 'video' && currentVideos.length > 0) {
          focusArea = 'loadMore';
          selectedIndex = currentVideos.length;
        } else if (focusArea === 'modalCategory') {
          selectedIndex = (selectedIndex + 1) % remainingCategories.length;
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (focusArea === 'modalCategory') {
          selectedIndex = (selectedIndex - 1 + remainingCategories.length) % remainingCategories.length;
        } else if (focusArea === 'loadMore') {
          focusArea = 'video';
          selectedIndex = currentVideos.length - 1;
          scrollToSelectedCard();
        } else if (focusArea === 'video') {
          focusArea = 'category';
          selectedIndex = 0;
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (focusArea === 'addCategory') {
          openAllCategoriesModal();
          focusArea = 'modalCategory'; // Modal 열림 후 포커스 이동
          selectedIndex = 0;
        } else if (focusArea === 'modalCategory' && remainingCategories[selectedIndex]) {
          addCategory(remainingCategories[selectedIndex]);
          closeAllCategoriesModal();
          focusArea = 'category'; // Modal 닫힌 후 카테고리로 포커스 복구
        } else if (focusArea === 'loadMore') {
          loadMoreVideos();
        } else if (focusArea === 'video' && currentVideos[selectedIndex]) {
          openFullscreenVideo(currentVideos[selectedIndex]); // Enter 키와 클릭의 동작 통일
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (showAllCategoriesModal) {
          closeAllCategoriesModal();
          focusArea = 'category';
        } else {
          focusArea = 'category';
          selectedIndex = 0;
        }
        break;

      default:
        break;
    }
  }





  onMount(async () => {
    randomCategories = getRandomCategories();
    selectedCategory = randomCategories[0]?.name || '';

    if (!selectedCategory) {
      console.error('No categories available');
      return;
    }

    const fetchedVideos = await fetchVideos(selectedCategory);
    if (fetchedVideos.length > 0) {
      videos[selectedCategory] = fetchedVideos;
      selectedIndex = 0; // 첫 번째 비디오 선택
      focusArea = 'video'; // 초기 포커스 설정
    } else {
      console.warn('No videos found for the initial category:', selectedCategory);
    }
  });

  console.log('Current State:', {
    showModal,
    showAllCategoriesModal,
    selectedVideo,
    selectedCategory,
    videos,
  });

</script>


<svelte:window on:keydown={handleKeydown}/>

<div class="page-container">
  <header>
    <div class="category-buttons">
      {#each randomCategories as category}
        <div class="category-item">
          <!-- 카테고리 버튼 -->
          <img 
            src={category.image} 
            alt={category.displayName}
            class="category-button"
            class:selected={selectedCategory === category.name}
            on:click={() => selectCategory(category.name)}
          />
          <!-- 카테고리 이름 -->
          <span 
            class="category-name" 
            class:selected={selectedCategory === category.name}>
            {category.displayName}
          </span>
        </div>
      {/each}
      <!-- "+" 버튼 -->
      <button
        class="add-category-button"
        class:selected={focusArea === 'addCategory'} 
        on:click={openAllCategoriesModal}
      > <!-- focusArea가 'addCategory'일 때 강조 -->
        +
      </button>
    </div>
  </header>



  <section class="video-section">
    <div class="video-scroll" bind:this={scrollContainer}>
      <div class="video-container">
        <!-- 비디오가 있을 경우 -->
        {#if videos[selectedCategory]?.length > 0}
          {#each videos[selectedCategory] as video, index}
          <div 
            class="video-card" 
            class:selected={index === selectedIndex && focusArea === 'video'}
            on:click={() => openFullscreenVideo(video)} 
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
        <!-- 추가 로드 버튼 -->
        {#if pageTokens[selectedCategory]}
          <button
              class="load-more-button"
              class:selected={focusArea === 'loadMore'}
              on:click={loadMoreVideos}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? '로딩 중...' : '더 보기'}
            </button>
        {/if}
      </div>
    </div>
  </section>

  {#if showModal}
    <div class="modal-overlay video-modal" on:click={closeModal}>
      <div class="modal-content video-modal" on:click|stopPropagation>
        <button class="close-button" on:click={closeModal}>×</button>
        <div class="modal-video-wrapper">
          {#if selectedVideo}
            {#if selectedVideo.id?.videoId}
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}?autoplay=1&origin=https://your-domain.com`}
              title={selectedVideo.snippet.title || 'YouTube Video'}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowfullscreen
            ></iframe>
            {:else}
              <p>유효한 비디오 ID를 찾을 수 없습니다.</p>
            {/if}
          {:else}
            <p>비디오 데이터를 불러오는 중입니다...</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if showAllCategoriesModal}
  <div class="modal-overlay category-modal" on:click={closeAllCategoriesModal}>
    <div class="modal-content category-modal" on:click|stopPropagation>
      <button class="close-button" on:click={closeAllCategoriesModal}>×</button>
      <h2>추천되지 않은 카테고리</h2>
      <div class="remaining-categories">
        {#each remainingCategories as category, index}
          <div 
            class="category-item" 
            class:selected={focusArea === 'modalCategory' && selectedIndex === index}
            on:click={() => addCategory(category)}
          >
            <img 
              src={category.image} 
              alt={category.displayName}
              class="category-button"
            />
            <span class="category-label">{category.displayName}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
  {/if}



</div>


<style>
  /* 페이지 컨테이너 스타일 */
  .page-container {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    padding-left: 250px;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    background-image: url('background.png');
    background-size: cover;
    background-position: center;
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
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 20px; /* 버튼 간격 */
    margin-bottom: 30px;
    padding: 10px 0;
    width: 100%;
    height: auto; /* 높이 자동 조정 */
    overflow-y: hidden; /* 세로 스크롤바 숨김 */
    overflow-x: auto; /* 가로 스크롤바 자동 */
    box-sizing: border-box; /* 패딩 포함 크기 계산 */
    margin-top: 20px; /* 버튼 전체 위치 아래로 이동 */
  }


  .category-item {
    position: relative; /* 텍스트를 버튼 기준으로 고정하기 위한 부모 위치 설정 */
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 50px; /* 버튼 아래 여백 추가 */
  }
  .category-item.selected {
    outline: 3px solid #ff9900;
    border-radius: 12px;
    transform: scale(1.05);
    transition: transform 0.3s ease, outline 0.3s ease;
  }


  .category-button {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    background: none;
    padding: 0;
  }



  .category-button:hover {
    transform: translateY(-5px);
    filter: brightness(1.2);
  }

  .category-button.selected {
    transform: translateY(-5px);
    filter: drop-shadow(0 4px 8px rgba(255, 153, 0, 0.5));
  }
  .category-button.selected::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      background-color: #ff9900;
      border-radius: 50%;
  }

  .category-name {
    position: absolute; /* 버튼 아래 고정 위치 설정 */
    top: 220px; /* 버튼 아래로 10px 여유 */
    left: 50%; /* 버튼 기준으로 가로 중앙 정렬 */
    transform: translateX(-50%); /* 가로 정렬을 버튼 중앙으로 */
    font-size: 36px;
    font-weight: bold;
    color: #333;
    text-align: center;
    white-space: nowrap; /* 텍스트 줄 바꿈 방지 */
  }

  .category-button.selected + .category-name {
    color: #ff9900; /* 선택된 텍스트 강조 */
  }

  .video-section {
    margin-top: auto;
    width: 100%;
  }

  .video-scroll {
    width: 100%;
    overflow-x: auto;
    padding: 20px 0;
    margin-right: -20px;
  }

  .video-container {
    display: flex;
    gap: 20px;
    padding: 0 20px;
    padding-right: 40px;
    width: max-content;
  }

  .video-card {
    flex: 0 0 500px;
    height: 600px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, outline 0.3s ease;
    cursor: pointer;
  }

  .video-card.selected {
    outline: 6px solid #ff9900;
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  }

  .load-more-button {
    flex: 0 0 100px;
    height: 100px;
    margin: auto 0;
    border-radius: 50%;
    background-color: white;
    border: 2px solid #ff9900;
    color: #ff9900;
    font-size: 1.2em;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .load-more-button:hover,
  .load-more-button.selected {
    background-color: #ff9900;
    color: white;
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .load-more-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .remaining-categories {
    display: flex; /* 가로 정렬 */
    flex-wrap: wrap; /* 줄 바꿈 허용 */
    justify-content: center; /* 중앙 정렬 */
    gap: 20px; /* 항목 간 간격 */
    padding: 20px;
  }

  .remaining-categories .category-item {
    display: flex;
    flex-direction: column; /* 버튼과 텍스트 세로 정렬 */
    align-items: center;
    gap: 12px; /* 버튼과 텍스트 간 간격 */
  }

  .remaining-categories .category-button {
    width: 240px; /* 버튼 크기 2배 */
    height: 240px; /* 버튼 크기 2배 */
    border-radius: 16px; /* 둥근 모서리 */
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .remaining-categories .category-label {
    font-size: 36px; /* 텍스트 크기 */
    font-weight: bold;
    color: #333; /* 텍스트 색상 */
    text-align: center;
  }

  .modal-content {
    background: white;
    padding: 60px; /* 모달 크기 확대 */
    border-radius: 16px;
    max-width: 90%; /* 모달 너비 */
    max-height: 90%; /* 모달 높이 */
    margin: auto;
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px; /* 항목 간격 */
  }


  .modal-content h2 {
    font-size: 1.5em;
    margin-bottom: 20px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
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

  /* 스크롤바 스타일링 */
  .video-scroll::-webkit-scrollbar {
    height: 8px;
  }

  .video-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .video-scroll::-webkit-scrollbar-thumb {
    background: #ff9900;
    border-radius: 4px;
  }

  .video-scroll::-webkit-scrollbar-thumb:hover {
    background: #ffc400;
  }


  .add-category-button {
    width: 100px; /* 버튼 너비 */
    height: 100px; /* 버튼 높이 */
    font-size: 3em; /* "+" 글자 크기 */
    border-radius: 50%; /* 둥근 버튼 */
    cursor: pointer;
    background-color: #ff9900;
    color: white;
    border: none;
    display: flex; /* Flexbox 활성화 */
    align-items: center; /* 수직 중앙 정렬 */
    justify-content: center; /* 수평 중앙 정렬 */
    margin-left: 10px;
    transition: all 0.3s ease;
    text-align: center; /* 텍스트 정렬 */
  }

  .add-category-button:hover {
    background-color: #ffc400;
  }


  .selected-category-name {
    text-align: center;
    margin-top: 20px; /* 버튼과 텍스트 간격 */
  }

  .selected-category-name span {
    font-size: 40px; /* 텍스트 크기 */
    font-weight: bold;
    color: #ff9900; /* 텍스트 색상 */
  }
  .add-category-button.selected,
  .load-more-button.selected {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid #ff9900;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }


</style>
