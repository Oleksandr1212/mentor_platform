import API_URL from './config';
const BASE_URL = `${API_URL}/api/reviews`;

class ReviewStore {
    async getReviewsForMentor(mentorId) {
        try {
            const response = await fetch(`${BASE_URL}/${mentorId}`);
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();

            // Маппинг полів БД до того, що очікують компоненти
            return data.map(r => ({
                id: r.id,
                author: r.author_name,
                rating: r.rating,
                text: r.text || '',
                date: new Date(r.created_at).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            }));
        } catch (error) {
            console.error('getReviewsForMentor error:', error);
            return [];
        }
    }

    async addReview(reviewData) {
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mentor_id: reviewData.mentorId,
                    author_id: reviewData.authorId || null,
                    author_name: reviewData.author,
                    rating: reviewData.rating,
                    text: reviewData.text
                })
            });
            if (!response.ok) throw new Error('Failed to add review');
            return await response.json();
        } catch (error) {
            console.error('addReview error:', error);
            throw error;
        }
    }

    async getAverageRating(mentorId) {
        const mentorReviews = await this.getReviewsForMentor(mentorId);
        if (mentorReviews.length === 0) return 0;
        const sum = mentorReviews.reduce((acc, r) => acc + r.rating, 0);
        return parseFloat((sum / mentorReviews.length).toFixed(1));
    }

    async getReviewCount(mentorId) {
        const reviews = await this.getReviewsForMentor(mentorId);
        return reviews.length;
    }
}

export const reviewStore = new ReviewStore();
