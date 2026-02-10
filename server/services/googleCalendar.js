import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Ініціалізація API календаря
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Створює подію в Google Calendar з посиланням на Google Meet
 * @param {Object} bookingDetails - { summary, description, startTime, endTime }
 */
export const createCalendarEvent = async ({ summary, description, startTime, endTime }) => {
    try {
        const event = {
            summary,
            description,
            start: {
                dateTime: startTime,
                timeZone: 'Europe/Kiev',
            },
            end: {
                dateTime: endTime,
                timeZone: 'Europe/Kiev',
            }
        };

        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            resource: event,
            sendUpdates: 'none'
        });

        console.log('Google API Response: Event created successfully');

        return {
            id: response.data.id,
            link: response.data.htmlLink,
            status: 'confirmed',
        };
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw error;
    }
};

/**
 * Отримує зайняті інтервали з Google Calendar
 * @param {string} timeMin - ISO string
 * @param {string} timeMax - ISO string
 */
export const getBusyIntervals = async (timeMin, timeMax) => {
    try {
        const response = await calendar.freebusy.query({
            resource: {
                timeMin,
                timeMax,
                timeZone: 'Europe/Kiev',
                items: [{ id: 'primary' }],
            },
        });

        const busySlots = response.data.calendars['primary'].busy;
        return busySlots; // Array of { start, end }
    } catch (error) {
        console.error('Error fetching busy intervals:', error);
        throw error;
    }
};
