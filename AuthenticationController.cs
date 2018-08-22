using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using SE.DSP.DSPToolSuite.Web.Services;
using SE.DSP.DSPToolSuite.Web.Entities;
using System;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace SE.DSP.DSPToolSuite.Web.Controllers
{


  [Route("api/[controller]")]
  public class AuthenticationController : Controller
  {
    private readonly IDMSConfig _IDMSConfig;
    private readonly IAntiforgery _antiForgeryService;
    public AuthenticationController(IDMSConfig idmsConfig, IAntiforgery antiForgeryService)
    {
      _IDMSConfig = idmsConfig;
      _antiForgeryService = antiForgeryService;
    }

    [Route("login")]
    [HttpGet]
    public void Login()
    {
      this.HttpContext.ChallengeAsync("Application", new AuthenticationProperties() { RedirectUri = "/" }).Wait();
    }

    [Route("logout")]
    [HttpGet]
    public async Task<IActionResult> Logout()
    {
      await this.HttpContext.SignOutAsync("CookieMiddlewareInstance"); //do not use this.HttpContext.Authentication.SignOutAsync. This fails to signout user

      string domain = this.HttpContext.Request.Scheme.ToString();
      string host = this.HttpContext.Request.Host.ToString();

      string redirectURI = WebUtility.UrlEncode($"{domain}://{host}/welcome");
      return Redirect($"{_IDMSConfig.URI}/identity/VFP_IDMS_IDPSloInit?RelayState={redirectURI}");
    }

    [Route("xsrftoken")]
    [HttpGet]
    public IActionResult GetXSRFToken()
    {
      var token = _antiForgeryService.GetTokens(HttpContext).RequestToken;
      HttpContext.Response.Cookies.Append("XSRF-TOKEN", token, new CookieOptions { HttpOnly = false });
      return new StatusCodeResult(StatusCodes.Status200OK);
    }
  }
}
