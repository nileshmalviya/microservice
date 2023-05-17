using JwtAuthanticationManager.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace JwtAuthanticationManager
{

    public class JwtTokenHandler
    {
        public const string JWT_SECURITY_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY3MjA2MTg2NSwiaWF0IjoxNjcyMDYxODY1fQ.JKXKk1_9SzrBechenveh9UmWD5sleGFAiyPkeLfr1LY\r\n";
        private const int JWT_TOKEN_VALIDITY_MINS = 20;
        private const int JWT_TOKEN_VALIDITY_MAXS = 30;

        public AuthenticationResponse? GenerateJwtToken(List<UserAccount> userList, AuthenticationRequest authenticationRequest)
        {
            if (string.IsNullOrWhiteSpace(authenticationRequest.UserEmail) || string.IsNullOrWhiteSpace(authenticationRequest.Password))
                return null;
            var userAccount = userList.Where(x => x.UserEmail == authenticationRequest.UserEmail && x.Password == authenticationRequest.Password).FirstOrDefault();
            if (userAccount == null)
            { return null; }
           return authenticationResponse(userAccount, authenticationRequest);
        }
        public AuthenticationResponse? authenticationResponse(UserAccount userAccount, AuthenticationRequest authenticationRequest) {

            var tokenExpiryTimeStamp = DateTime.Now.AddMonths(JWT_TOKEN_VALIDITY_MINS);
            var tokenKey = Encoding.ASCII.GetBytes(JWT_SECURITY_KEY);
            var claimsIdentity = new ClaimsIdentity(new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Name, authenticationRequest.UserEmail),
                    new Claim(ClaimTypes.Role, userAccount.Role),
            });
            var signingCredantials = new SigningCredentials(
                new SymmetricSecurityKey(tokenKey),
                SecurityAlgorithms.HmacSha256Signature);

            var securityTokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = claimsIdentity,
                Expires = tokenExpiryTimeStamp,
                SigningCredentials = signingCredantials
            };

            var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
            var securityToken = jwtSecurityTokenHandler.CreateToken(securityTokenDescriptor);
            var token = jwtSecurityTokenHandler.WriteToken(securityToken);
            return new AuthenticationResponse
            {

                UserEmail = userAccount.UserEmail,
                ExpiresIn = (int)tokenExpiryTimeStamp.Subtract(DateTime.Now).TotalSeconds,
                JwtToken = token,
                Role = userAccount.Role,
                UserId = userAccount.UserId
            };
        }


    }


}