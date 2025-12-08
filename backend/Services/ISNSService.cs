namespace BloodLine.Services;

public interface ISNSService
{
    Task SendAppointmentNotificationAsync(string phoneNumber, string email, string message);
}